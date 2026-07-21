import { AmbossClient, type ClientConfig } from '@ambosstech/core';

import { Environments } from './resources/environments.js';
import { Transactions } from './resources/transactions.js';
import { Wallets } from './resources/wallets.js';
import { Webhooks } from './resources/webhooks.js';

export type PaymentsConfig = ClientConfig & {
  webhookSecret?: string;
};

export class Payments extends AmbossClient {
  readonly webhooks: Webhooks;

  #environments?: Environments;
  #wallets?: Wallets;
  #transactions?: Transactions;

  constructor(config: PaymentsConfig = {}) {
    super(config);
    this.webhooks = new Webhooks(config.webhookSecret);
  }

  get environments(): Environments {
    this.requireServiceApiKey('payments.environments');
    this.#environments ??= new Environments(this.graphqlClient);
    return this.#environments;
  }

  get wallets(): Wallets {
    this.requireServiceApiKey('payments.wallets');
    this.#wallets ??= new Wallets(this.graphqlClient);
    return this.#wallets;
  }

  get transactions(): Transactions {
    this.requireServiceApiKey('payments.transactions');
    this.#transactions ??= new Transactions(this.graphqlClient);
    return this.#transactions;
  }

  static webhooks = Webhooks;
}
