import type { GraphQLClient } from 'graphql-request';

import { AmbossClient } from '@ambosstech/core';

import type {
  MintStreamTokenMutation,
  MintStreamTokenMutationVariables,
  StreamTokenScope,
} from './streamToken.types.js';

/**
 * Hand-authored — `payment.mutation.stream_token.mint` lands in
 * amboss-rails-api#565 (unmerged, not yet deployed), so this SDK's schema
 * snapshot (`packages/core/schema/rails.graphql`) doesn't have it yet and
 * `pnpm --filter @ambosstech/payments run codegen` cannot generate a typed
 * document for it. Written by hand against PR #565's schema in the meantime.
 *
 * TODO(AMB-3016): once #565 merges and deploys, run
 * `pnpm --filter @ambosstech/core run refresh-schema && pnpm --filter @ambosstech/payments run codegen`
 * and delete this file (and `streamToken.types.ts`) in favor of the generated
 * `MintStreamToken` operation in `../generated/sdk.js`.
 */
const MintStreamTokenDocument = `
  mutation MintStreamToken($input: MintStreamTokenInput!) {
    payment {
      stream_token {
        mint(input: $input) {
          token
          expires_at
        }
      }
    }
  }
`;

/** Mints a short-lived JWT scoped to one transaction/wallet/environment, for use as the SSE stream's bearer token. */
export async function mintStreamToken(
  graphqlClient: GraphQLClient,
  scope: StreamTokenScope,
  id: string,
): Promise<MintStreamTokenMutation['payment']['stream_token']['mint']> {
  try {
    const res = await graphqlClient.request<
      MintStreamTokenMutation,
      MintStreamTokenMutationVariables
    >(MintStreamTokenDocument, { input: { scope, id } });
    return res.payment.stream_token.mint;
  } catch (err) {
    throw AmbossClient.translateError(err);
  }
}
