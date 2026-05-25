export type FetchLike = typeof fetch;

export type ClientConfig = {
  apiKey?: string;
  baseUrl?: string;
  fetch?: FetchLike;
  timeoutMs?: number;
};

export type ResolvedClientConfig = {
  apiKey: string | undefined;
  baseUrl: string;
  fetch: FetchLike;
  timeoutMs: number;
};

export type Pagination = {
  limit: number;
  offset: number;
};
