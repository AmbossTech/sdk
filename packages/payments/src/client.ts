import { AmbossClient, type ClientConfig } from '@ambosstech/core';

import { Environments } from './resources/environments.js';
import { Transactions } from './resources/transactions.js';
import { Wallets } from './resources/wallets.js';
import type { PrepareSendParams } from './resources/transactions.types.js';
import { Webhooks } from './resources/webhooks.js';

export type PaymentsConfig = ClientConfig & {
  webhookSecret?: string;
  /**
   * Wallets to pre-warm for sending. Each entry's node endpoint is fetched and
   * its admin macaroon decrypted in the background, so the first `send()` for
   * that wallet skips two API round-trips and two Argon2id passes.
   *
   * Per-wallet failures are ignored here — pre-warming is an optimization, and
   * `send()` redoes the work and surfaces the real error. Requires
   * `serviceApiKey`: passing this without one throws `ConfigError` from the
   * constructor rather than pre-warming nothing in silence.
   */
  send?: readonly PrepareSendParams[];
};

export class Payments extends AmbossClient {
  readonly webhooks: Webhooks;

  #environments?: Environments;
  #wallets?: Wallets;
  #transactions?: Transactions;

  constructor(config: PaymentsConfig = {}) {
    super(config);
    this.webhooks = new Webhooks(config.webhookSecret);
    // Resolving the resource here rather than inside the loop keeps a missing
    // serviceApiKey a constructor-time ConfigError. Reaching it through the
    // getter mid-loop would land that throw in the per-wallet catch below and
    // pre-warm nothing, silently and forever.
    if (config.send?.length) void this.#prewarmSend(this.transactions, config.send);
  }

  /**
   * Fire-and-forget pre-warm of the configured wallets. Sequential on purpose:
   * Argon2id is synchronous and CPU-bound, so running the wallets concurrently
   * would interleave nothing and only delay the first one becoming ready.
   *
   * Poll `transactions.isSendReady(walletId)` to see when a wallet is done, or
   * `await transactions.prepareSend(...)` instead of using this option when you
   * need to observe failures.
   */
  async #prewarmSend(
    transactions: Transactions,
    wallets: readonly PrepareSendParams[],
  ): Promise<void> {
    for (const wallet of wallets) {
      try {
        await transactions.prepareSend(wallet);
      } catch {
        // Deliberately swallowed: `send()` re-runs the derivation and throws
        // the real DecryptionError / ApiError where the caller can catch it.
      }
    }
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
