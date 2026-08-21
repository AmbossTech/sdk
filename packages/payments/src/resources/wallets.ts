import type { GraphQLClient } from 'graphql-request';

import type { ResolvedClientConfig } from '@ambosstech/core';

import {
  getSdk,
  type CreatePaymentsWalletInput,
  type PaymentsWalletFieldsFragment,
  type SimplePaymentsWalletFieldsFragment,
} from '../generated/sdk.js';
import type { PaymentEvent } from '../types/webhooks.js';
import { translateSdkErrors } from './sdkErrors.js';
import { watchPaymentEventStream } from './streaming.js';
import type { WatchStreamOptions } from './streaming.types.js';

export class Wallets {
  readonly #sdk: ReturnType<typeof getSdk>;
  readonly #graphqlClient: GraphQLClient;
  readonly #config: ResolvedClientConfig;

  constructor(graphqlClient: GraphQLClient, config: ResolvedClientConfig) {
    this.#sdk = getSdk(graphqlClient, translateSdkErrors);
    this.#graphqlClient = graphqlClient;
    this.#config = config;
  }

  async list(params: { environmentId: string }): Promise<SimplePaymentsWalletFieldsFragment[]> {
    const res = await this.#sdk.ListWallets({ environmentId: params.environmentId });
    return res.payment.wallet.find_many.list;
  }

  async get(id: string): Promise<PaymentsWalletFieldsFragment> {
    const res = await this.#sdk.GetWallet({ id });
    return res.payment.wallet.find_one;
  }

  async create(input: CreatePaymentsWalletInput): Promise<PaymentsWalletFieldsFragment> {
    const res = await this.#sdk.CreateWallet({ input });
    return res.payment.wallet.create;
  }

  async delete(id: string): Promise<boolean> {
    const res = await this.#sdk.DeleteWallet({ id });
    return res.payment.wallet.delete;
  }

  /**
   * Streams live `PaymentEvent`s for every transaction on a wallet over SSE —
   * the wallet/environment-scoped counterpart to `Transactions.watch`. Mints a
   * short-lived stream token via GraphQL, then reads
   * `GET /payments/stream/wallets/:id` as `text/event-stream` (plain `fetch`,
   * not `EventSource`, so it works in Node and browsers alike).
   *
   * Unlike a transaction stream, a wallet has no terminal state: per the SSE
   * design doc this stream stays open until the token's max stream lifetime
   * (30 minutes) elapses — there is no other natural end. Call `watchEvents`
   * again (which mints a fresh token) to reconnect.
   *
   * Rejects with `ApiError` (401 missing/invalid token, 404 unknown wallet)
   * before the stream opens, or `NetworkError` for a transport failure or an
   * aborted `options.signal` — the same error types every other resource
   * method throws.
   */
  watchEvents(id: string, options?: WatchStreamOptions): AsyncIterable<PaymentEvent> {
    return watchPaymentEventStream(
      this.#graphqlClient,
      this.#config,
      'WALLET',
      `/payments/stream/wallets/${id}`,
      id,
      options,
    );
  }
}
