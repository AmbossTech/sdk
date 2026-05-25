# @ambosstech/core

Shared base client, HTTP/GraphQL transport, and error types for Amboss SDKs.

This package is a transitive dependency of domain packages such as [`@ambosstech/payments`](../payments). You normally do not install it directly.

## Exports

```ts
import {
  AmbossClient,
  ApiError,
  ConfigError,
  NetworkError,
  AmbossSdkError,
  type ClientConfig,
  type FetchLike,
  type Pagination,
} from '@ambosstech/core';
```

### `AmbossClient`

Base class for domain clients. Holds the resolved config and a `GraphQLClient` instance preconfigured with the `Authorization: Bearer <apiKey>` header when `apiKey` is provided.

| Method                                           | Purpose                                                                       |
| ------------------------------------------------ | ----------------------------------------------------------------------------- |
| `resolveConfig(config)`                          | Static — applies defaults (prod base URL, fetch, 30s timeout).                |
| `translateError(err)`                            | Static — maps `graphql-request` errors to `ApiError` / `NetworkError`.        |
| `requireApiKey(operation)`                       | Protected — throws `ConfigError` if `apiKey` was not provided.                |
| `gqlRequest(document, variables, operationName)` | Protected — runs a GraphQL request via the shared client, translating errors. |

Domain packages extend `AmbossClient` and expose their own resource namespaces.

## Schema

The pinned GraphQL schema lives at [`schema/amboss.graphql`](./schema/amboss.graphql). Refresh it from the dev API:

```bash
pnpm --filter @ambosstech/core run refresh-schema
```

The endpoint defaults to `https://rails-dev.amboss.tech/graphql`. Override with `AMBOSS_SCHEMA_URL`.

## License

MIT
