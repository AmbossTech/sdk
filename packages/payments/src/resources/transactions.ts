import type { GraphQLClient } from 'graphql-request';

import { createMasterPasswordHash } from '../crypto/argon2.js';
import { decryptAdminMacaroonWithMasterKey } from '../crypto/decryptAdminMacaroon.js';
import { PaymentSendError } from '../errors.js';
import {
  getSdk,
  type CreateReceiveTransactionInput,
  type CreateSendTransactionInput,
  type PaymentsTransactionFieldsFragment,
} from '../generated/sdk.js';
import { sendAssetPayment } from '../node/lit.js';
import { sendLndPayment } from '../node/lnd.js';
import type { PaymentLifecycleStatus } from '../node/types.js';
import { selectSendNode } from './sendNode.js';
import type { SendDestination, SendParams, SendResult } from './transactions.types.js';

const DEFAULT_TIMEOUT_SECONDS = 60;

/**
 * Taproot asset group keys come from GraphQL as hex (a 33-byte compressed
 * secp256k1 pubkey → 66 hex chars). litd's REST gateway expects the `group_key`
 * bytes field base64-encoded; passing the hex string makes the gateway
 * base64-decode it (66 chars → 49 bytes) and tapd rejects it with
 * "error parsing group key: malformed public key: invalid length: 49".
 * Convert hex → raw bytes → base64 so tapd parses the 33-byte compressed key.
 */
function hexGroupKeyToBase64(groupKeyHex: string): string {
  return Buffer.from(groupKeyHex, 'hex').toString('base64');
}

function buildCreateSendInput(params: SendParams): CreateSendTransactionInput {
  const { walletId, destination, idempotencyKey, metadata } = params;
  const input: CreateSendTransactionInput = { wallet_id: walletId };

  if ('bolt11' in destination) {
    input.request = { bolt11: destination.bolt11 };
  } else {
    input.address = {
      lightning_address: destination.lightningAddress,
      amount: destination.amountSats,
    };
  }
  if (idempotencyKey) input.idempotency_key = idempotencyKey;
  if (metadata && Object.keys(metadata).length > 0) input.metadata = JSON.stringify(metadata);

  return input;
}

/** Amount (sats) to pass to LND — only for zero-amount BOLT11 invoices. */
function lndAmountSats(destination: SendDestination): string | undefined {
  return 'bolt11' in destination ? destination.amountSats : undefined;
}

export class Transactions {
  readonly #sdk: ReturnType<typeof getSdk>;
  #teamId?: string;

  constructor(graphqlClient: GraphQLClient) {
    this.#sdk = getSdk(graphqlClient);
  }

  async createReceive(
    input: CreateReceiveTransactionInput,
  ): Promise<PaymentsTransactionFieldsFragment> {
    const res = await this.#sdk.CreateReceiveTransaction({ input });
    return res.payment.transaction.create_receive;
  }

  /**
   * Sends a Lightning / Taproot Asset payment from a wallet — the SDK equivalent
   * of the amboss-rails send dialog.
   *
   * For **live** wallets it creates the send transaction, decrypts the node
   * admin macaroon in-process using the team password, then executes the
   * payment directly against the node's REST gateway and resolves with the
   * terminal result.
   *
   * For **sandbox** wallets there is no node and no real settlement: the SDK
   * just creates the send and returns (`payment` is `null`). The backend
   * settles the transaction asynchronously according to the
   * `amb_sandbox_behavior` metadata (`complete` / `fail` / `expire`; default
   * `expire`). No password is required.
   */
  async send(params: SendParams): Promise<SendResult> {
    const { walletId, password, feeLimitSats, destination, onUpdate, signal } = params;
    const timeoutSeconds = params.timeoutSeconds ?? DEFAULT_TIMEOUT_SECONDS;

    // 1. Detect sandbox up-front (no password needed). Sandbox wallets settle
    //    server-side, so the SDK only has to create the send.
    const envRes = await this.#sdk.GetWalletEnvironmentType({ id: walletId });
    const isSandbox = envRes.payment.wallet.find_one.environment.type === 'SANDBOX';

    if (isSandbox) {
      const createRes = await this.#sdk.CreateSendTransaction({
        input: buildCreateSendInput(params),
      });
      return { transaction: createRes.payment.transaction.create_send, payment: null };
    }

    // 2. Live wallet — a team password is required to decrypt the node macaroon.
    //    teamId is the Argon2 salt; callers using a service API key (no `user`
    //    access) must supply it.
    if (!password) {
      throw new PaymentSendError('A team password is required to send from a live wallet.');
    }
    const teamId = params.teamId ?? (await this.#resolveTeamId());
    const { masterKey, masterPasswordHash } = createMasterPasswordHash(password, teamId);

    // 3. Resolve the node + its credentials — node_permissions is gated on the
    //    password hash, so a wrong password is rejected here before any payment.
    const permRes = await this.#sdk.GetWalletNodePermissions({
      id: walletId,
      password_hash: masterPasswordHash,
    });
    const wallet = permRes.payment.wallet.find_one;
    const isAsset = wallet.asset.type !== 'BASE_ASSET';
    const node = selectSendNode(wallet.node_permissions.nodes, isAsset);
    if (!node) {
      throw new PaymentSendError(
        isAsset
          ? 'No litd endpoint available for this wallet.'
          : 'No LND endpoint available for this wallet.',
      );
    }

    // 4. Decrypt the admin macaroon in-process (reusing the master key).
    const macaroon = decryptAdminMacaroonWithMasterKey({
      masterKey,
      encryptedSymmetricKey: wallet.node_permissions.encrypted_symmetric_key,
      encryptedMacaroon: node.encryptedMacaroon,
    });

    // 5. Create the send transaction → backend returns the bolt11 to pay.
    const createRes = await this.#sdk.CreateSendTransaction({
      input: buildCreateSendInput(params),
    });
    const transaction = createRes.payment.transaction.create_send;
    if (!transaction.payment_request) {
      throw new PaymentSendError('Backend did not return a payment request.');
    }

    // 6. Execute the payment against the node.
    const onStatus = onUpdate
      ? (status: PaymentLifecycleStatus) => onUpdate({ status })
      : undefined;
    const common = {
      restHost: node.restHost,
      macaroon,
      tlsCert: node.tlsCert,
      onUpdate: onStatus,
      signal,
    };

    const payment = isAsset
      ? await sendAssetPayment({
          ...common,
          body: {
            payment_request: {
              payment_request: transaction.payment_request,
              fee_limit_sat: feeLimitSats,
              timeout_seconds: timeoutSeconds,
            },
            ...(wallet.asset.taproot_asset_details?.group_key
              ? {
                  group_key: hexGroupKeyToBase64(
                    wallet.asset.taproot_asset_details.group_key,
                  ),
                }
              : {}),
          },
        })
      : await sendLndPayment({
          ...common,
          body: {
            payment_request: transaction.payment_request,
            ...(lndAmountSats(destination) ? { amt: lndAmountSats(destination) } : {}),
            fee_limit_sat: feeLimitSats,
            timeout_seconds: timeoutSeconds,
          },
        });

    return { transaction, payment };
  }

  async #resolveTeamId(): Promise<string> {
    if (this.#teamId) return this.#teamId;
    const res = await this.#sdk.GetTeamId();
    this.#teamId = res.user.team.id;
    return this.#teamId;
  }
}
