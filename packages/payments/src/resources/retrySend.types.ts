import type { PaymentsTransactionFieldsFragment } from '../generated/sdk.js';

/**
 * Hand-written GraphQL types for `payment.transaction.retry_send`.
 *
 * TODO(AMB-3091): amboss-rails-api#577 (unmerged) adds this mutation to the
 * live schema. Once it merges and deploys to production, run
 * `pnpm --filter @ambosstech/core run refresh-schema && pnpm --filter @ambosstech/payments run codegen`
 * to generate the real `RetrySendTransaction*` types/document in
 * `../generated/sdk.js`, then delete this file and `retrySend.ts` in favor of
 * the generated versions. Names here match PR #577's schema exactly so the
 * swap is a rename, not a rewrite.
 */
export interface RetrySendTransactionInput {
  id: string;
}

export interface RetrySendTransactionMutationVariables {
  input: RetrySendTransactionInput;
}

export interface RetrySendTransactionMutation {
  payment: {
    transaction: {
      retry_send: PaymentsTransactionFieldsFragment;
    };
  };
}
