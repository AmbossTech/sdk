import { AmbossClient } from '@ambosstech/core';

import type { SdkFunctionWrapper } from '../generated/sdk.js';

/**
 * Wraps every generated SDK operation so raw `graphql-request` errors are
 * translated into the SDK's `ApiError` / `NetworkError`. Resource calls use
 * the generated client directly (not `AmbossClient.gqlRequest`), so without
 * this they would surface untranslated `ClientError`s, breaking the documented
 * error contract.
 */
export const translateSdkErrors: SdkFunctionWrapper = async (action) => {
  try {
    return await action();
  } catch (err) {
    throw AmbossClient.translateError(err);
  }
};
