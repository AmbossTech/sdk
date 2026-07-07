import { ClientError, GraphQLClient, type RequestDocument, type Variables } from 'graphql-request';

import { ApiError, ConfigError, NetworkError } from './errors.js';
import type { ClientConfig, FetchLike, ResolvedClientConfig } from './types.js';

const DEFAULT_BASE_URL = 'https://rails.amboss.tech/graphql';
const DEFAULT_TIMEOUT_MS = 30_000;

export class AmbossClient {
  protected readonly config: ResolvedClientConfig;
  protected readonly graphqlClient: GraphQLClient;

  constructor(config: ClientConfig = {}) {
    this.config = AmbossClient.resolveConfig(config);
    const { fetch: fetchImpl, timeoutMs } = this.config;
    this.graphqlClient = new GraphQLClient(this.config.baseUrl, {
      // Apply timeoutMs as a per-request abort signal, honoring a caller-supplied signal if present.
      fetch: (input, init) =>
        fetchImpl(input, { ...init, signal: init?.signal ?? AbortSignal.timeout(timeoutMs) }),
      headers: this.buildHeaders(),
    });
  }

  protected requireApiKey(operation: string): string {
    if (!this.config.apiKey) {
      throw new ConfigError(`${operation} requires an apiKey. Pass { apiKey } to the constructor.`);
    }
    return this.config.apiKey;
  }

  protected requireServiceApiKey(operation: string): string {
    if (!this.config.serviceApiKey) {
      throw new ConfigError(
        `${operation} requires a serviceApiKey. Pass { serviceApiKey } to the constructor.`,
      );
    }
    return this.config.serviceApiKey;
  }

  protected async gqlRequest<TData, TVariables extends Variables = Variables>(
    document: RequestDocument,
    variables?: TVariables,
    operationName?: string,
  ): Promise<TData> {
    this.requireApiKey(operationName ?? 'GraphQL request');
    try {
      return await this.graphqlClient.request<TData>({
        document,
        variables: variables ?? ({} as TVariables),
      });
    } catch (err) {
      throw AmbossClient.translateError(err);
    }
  }

  private buildHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'content-type': 'application/json',
      accept: 'application/json',
    };
    // Bearer key (cross-product) and service API key (payments) use different
    // headers; send whichever are provided.
    if (this.config.apiKey) {
      headers.authorization = `Bearer ${this.config.apiKey}`;
    }
    if (this.config.serviceApiKey) {
      headers['x-api-key'] = this.config.serviceApiKey;
    }
    return headers;
  }

  static resolveConfig(config: ClientConfig): ResolvedClientConfig {
    const fetchImpl: FetchLike = config.fetch ?? fetch;
    if (typeof fetchImpl !== 'function') {
      throw new ConfigError('No fetch implementation available. Pass `fetch` in client config.');
    }
    return {
      apiKey: config.apiKey,
      serviceApiKey: config.serviceApiKey,
      baseUrl: config.baseUrl ?? DEFAULT_BASE_URL,
      fetch: fetchImpl,
      timeoutMs: config.timeoutMs ?? DEFAULT_TIMEOUT_MS,
    };
  }

  static translateError(err: unknown): Error {
    if (err instanceof ClientError) {
      const status = err.response.status ?? 0;
      const gqlErrors = err.response.errors?.map((e) => ({
        message: e.message,
        path: e.path,
        extensions: e.extensions as Record<string, unknown> | undefined,
      }));
      const message = gqlErrors?.[0]?.message ?? err.message;
      return new ApiError({ message, status, response: err.response, graphqlErrors: gqlErrors });
    }
    if (err instanceof Error) {
      return new NetworkError(err.message, err);
    }
    return new NetworkError('Unknown network error', err);
  }
}
