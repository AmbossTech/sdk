import type { GraphQLClient } from 'graphql-request';

import {
  getSdk,
  type CreateReceiveTransactionInput,
  type PaymentsTransactionFieldsFragment,
} from '../generated/sdk.js';

export class Transactions {
  readonly #sdk: ReturnType<typeof getSdk>;

  constructor(graphqlClient: GraphQLClient) {
    this.#sdk = getSdk(graphqlClient);
  }

  async createReceive(
    input: CreateReceiveTransactionInput,
  ): Promise<PaymentsTransactionFieldsFragment> {
    const res = await this.#sdk.CreateReceiveTransaction({ input });
    return res.payment.transaction.create_receive;
  }
}
