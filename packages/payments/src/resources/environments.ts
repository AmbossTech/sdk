import type { GraphQLClient } from 'graphql-request';

import {
  getSdk,
  type CreatePaymentsEnvironmentInput,
  type PaymentsEnvironmentFieldsFragment,
  type SimplePaymentsEnvironmentFieldsFragment,
} from '../generated/sdk.js';
import { translateSdkErrors } from './sdkErrors.js';

export class Environments {
  readonly #sdk: ReturnType<typeof getSdk>;

  constructor(graphqlClient: GraphQLClient) {
    this.#sdk = getSdk(graphqlClient, translateSdkErrors);
  }

  async list(): Promise<SimplePaymentsEnvironmentFieldsFragment[]> {
    const res = await this.#sdk.ListEnvironments();
    return res.payment.environment.find_many.list;
  }

  async get(id: string): Promise<PaymentsEnvironmentFieldsFragment> {
    const res = await this.#sdk.GetEnvironment({ id });
    return res.payment.environment.find_one;
  }

  async create(input: CreatePaymentsEnvironmentInput): Promise<PaymentsEnvironmentFieldsFragment> {
    const res = await this.#sdk.CreateEnvironment({ input });
    return res.payment.environment.create.environment;
  }

  async delete(id: string): Promise<boolean> {
    const res = await this.#sdk.DeleteEnvironment({ id });
    return res.payment.environment.delete;
  }
}
