export type FetchLike = typeof fetch;

export type ClientConfig = {
  /** Bearer key, used across all products. Sent as `Authorization: Bearer <key>`. */
  apiKey?: string;
  /** Service API key with scoped permissions (payments). Sent as `x-api-key: <key>`. */
  serviceApiKey?: string;
  baseUrl?: string;
  fetch?: FetchLike;
  timeoutMs?: number;
};

export type ResolvedClientConfig = {
  apiKey: string | undefined;
  serviceApiKey: string | undefined;
  baseUrl: string;
  fetch: FetchLike;
  timeoutMs: number;
};

export type Pagination = {
  limit: number;
  offset: number;
};
