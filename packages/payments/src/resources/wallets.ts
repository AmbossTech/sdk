import type { GraphQLClient } from 'graphql-request';

import {
  getSdk,
  type CreatePaymentsWalletInput,
  type PaymentsWalletFieldsFragment,
  type SimplePaymentsWalletFieldsFragment,
} from '../generated/sdk.js';

export class Wallets {
  readonly #sdk: ReturnType<typeof getSdk>;

  constructor(graphqlClient: GraphQLClient) {
    this.#sdk = getSdk(graphqlClient);
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
}
