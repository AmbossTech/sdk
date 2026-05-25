export class AmbossSdkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AmbossSdkError';
  }
}

export class ConfigError extends AmbossSdkError {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigError';
  }
}

export class ApiError extends AmbossSdkError {
  readonly status: number;
  readonly response: unknown;
  readonly graphqlErrors: ReadonlyArray<{
    message: string;
    path?: ReadonlyArray<string | number>;
    extensions?: Record<string, unknown>;
  }>;

  constructor(params: {
    message: string;
    status: number;
    response?: unknown;
    graphqlErrors?: ReadonlyArray<{
      message: string;
      path?: ReadonlyArray<string | number>;
      extensions?: Record<string, unknown>;
    }>;
  }) {
    super(params.message);
    this.name = 'ApiError';
    this.status = params.status;
    this.response = params.response;
    this.graphqlErrors = params.graphqlErrors ?? [];
  }
}

export class NetworkError extends AmbossSdkError {
  readonly cause: unknown;
  constructor(message: string, cause: unknown) {
    super(message);
    this.name = 'NetworkError';
    this.cause = cause;
  }
}
