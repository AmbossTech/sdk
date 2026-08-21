/** Options shared by `Transactions.watch` and `Wallets.watchEvents`. */
export interface WatchStreamOptions {
  /** Aborts the stream connection. */
  signal?: AbortSignal;
}
