import type { GraphQLClient } from 'graphql-request';

import {
  getSdk,
  type CreatePaymentsEnvironmentInput,
  type PaymentsEnvironmentFieldsFragment,
} from '../generated/sdk.js';

export class Environments {
  readonly #sdk: ReturnType<typeof getSdk>;

  constructor(graphqlClient: GraphQLClient) {
    this.#sdk = getSdk(graphqlClient);
  }

  async list(): Promise<PaymentsEnvironmentFieldsFragment[]> {
    const res = await this.#sdk.ListEnvironments();
    return res.payment.environment.list;
  }

  async get(id: string): Promise<PaymentsEnvironmentFieldsFragment> {
    const res = await this.#sdk.GetEnvironment({ id });
    return res.payment.environment.get;
  }

  async create(input: CreatePaymentsEnvironmentInput): Promise<PaymentsEnvironmentFieldsFragment> {
    const res = await this.#sdk.CreateEnvironment({ input });
    return res.payment.environment.create;
  }

  async delete(id: string): Promise<boolean> {
    const res = await this.#sdk.DeleteEnvironment({ id });
    return res.payment.environment.delete;
  }
}
