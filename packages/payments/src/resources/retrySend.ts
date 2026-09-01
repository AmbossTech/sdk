import type { GraphQLClient } from 'graphql-request';

import { AmbossClient } from '@ambosstech/core';

import type { PaymentsTransactionFieldsFragment } from '../generated/sdk.js';
import type {
  RetrySendTransactionMutation,
  RetrySendTransactionMutationVariables,
} from './retrySend.types.js';

/**
 * Hand-authored — `payment.transaction.retry_send` lands in
 * amboss-rails-api#577 (unmerged, not yet deployed), so this SDK's schema
 * snapshot (`packages/core/schema/rails.graphql`) doesn't have it yet and
 * `pnpm --filter @ambosstech/payments run codegen` cannot generate a typed
 * document for it. Written by hand against PR #577's schema in the meantime.
 * Field selection mirrors the `PaymentsTransactionFields` fragment in
 * `transactions.graphql` so the return type lines up with
 * `PaymentsTransactionFieldsFragment`.
 *
 * TODO(AMB-3091): once #577 merges and deploys, run
 * `pnpm --filter @ambosstech/core run refresh-schema && pnpm --filter @ambosstech/payments run codegen`
 * and delete this file (and `retrySend.types.ts`) in favor of the generated
 * `RetrySendTransaction` operation in `../generated/sdk.js`.
 */
const RetrySendTransactionDocument = `
  mutation RetrySendTransaction($input: RetrySendTransactionInput!) {
    payment {
      transaction {
        retry_send(input: $input) {
          id
          wallet_id
          node_id
          idempotency_key
          direction
          status
          amount {
            id
            display_amount
            full_amount
          }
          amount_sats
          asset {
            id
            symbol
            type
            precision
          }
          fee
          payment_hash
          payment_request
          description
          error
          expires_at
          settled_at
          created_at
          updated_at
        }
      }
    }
  }
`;

/** Retries a FAILED send transaction, reusing its stored payment_request — no new invoice is minted. */
export async function retrySendTransaction(
  graphqlClient: GraphQLClient,
  paymentId: string,
): Promise<PaymentsTransactionFieldsFragment> {
  try {
    const res = await graphqlClient.request<
      RetrySendTransactionMutation,
      RetrySendTransactionMutationVariables
    >(RetrySendTransactionDocument, { input: { id: paymentId } });
    return res.payment.transaction.retry_send;
  } catch (err) {
    throw AmbossClient.translateError(err);
  }
}
