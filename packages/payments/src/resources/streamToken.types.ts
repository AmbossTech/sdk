/**
 * Hand-written GraphQL types for `payment.mutation.stream_token.mint`.
 *
 * TODO(AMB-3016): amboss-rails-api#565 (unmerged) adds this mutation to the
 * live schema. Once it merges and deploys to production, run
 * `pnpm --filter @ambosstech/core run refresh-schema && pnpm --filter @ambosstech/payments run codegen`
 * to generate the real `MintStreamToken*` types/document in
 * `../generated/sdk.js`, then delete this file and `streamToken.ts` in favor
 * of the generated versions. Names here match PR #565's schema exactly so the
 * swap is a rename, not a rewrite.
 *
 * (`WatchStreamOptions` lives in `streaming.types.ts`, not here — it's an SDK
 * option, not part of the GraphQL schema, so it survives the codegen swap.)
 */
export type StreamTokenScope = 'TRANSACTION' | 'WALLET' | 'ENVIRONMENT';

export interface MintStreamTokenInput {
  scope: StreamTokenScope;
  id: string;
}

export interface MintStreamTokenMutationVariables {
  input: MintStreamTokenInput;
}

export interface MintStreamTokenMutation {
  payment: {
    stream_token: {
      mint: {
        token: string;
        expires_at: string;
      };
    };
  };
}
