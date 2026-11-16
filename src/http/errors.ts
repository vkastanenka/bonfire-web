export const clientErrors = {
  missingFetch: {
    code: "MISSING_FETCH",
    message:
      "No fetch implementation found in environment, and none provided in config.",
  },
  invalidUrl: {
    code: "INVALID_URL",
    message: (url: string) => `Invalid URL provided: "${url}".`,
  },
  invalidTimeout: {
    code: "INVALID_TIMEOUT",
    message: "Timeout must be a positive number greater than 0ms.",
  },
  invalidMaxAttempts: {
    code: "INVALID_MAX_ATTEMPTS",
    message: "Retry maxAttempts must be an integer greater than or equal to 1.",
  },
} as const;

export type ClientErrorCode =
  (typeof clientErrors)[keyof typeof clientErrors]["code"];

export const requestErrors = {
  requestAborted: {
    code: "REQUEST_ABORTED",
    message: "The request was explicitly aborted by an AbortController.",
  },
  requestTimeout: {
    code: "REQUEST_TIMEOUT",
    message: "The request timed out before receiving a response.",
  },
  maxRetriesExceeded: {
    code: "MAX_RETRIES_EXCEEDED",
    message: "Maximum retry attempts reached without a successful response.",
  },
  fetchFailed: {
    code: "FETCH_FAILED",
    message: "The network request failed before reaching the server.",
  },
} as const;

export type RequestErrorCode =
  (typeof requestErrors)[keyof typeof requestErrors]["code"];

export const responseErrors = {
  httpError: {
    code: "HTTP_ERROR",
    message: (status: number, statusText: string) =>
      `HTTP error status: ${status}${statusText ? ` ${statusText}` : ""}`,
  },
  parseError: {
    code: "PARSE_ERROR",
    message:
      "The server returned a success status code, but the body content was malformed or non-JSON.",
  },
} as const;

export type ResponseErrorCode =
  (typeof responseErrors)[keyof typeof responseErrors]["code"];

export const httpErrorTypes = {
  base: "HttpError",
  client: "HttpClientError",
  network: "NetworkError",
  timeout: "TimeoutError",
} as const;

export class HttpClientError extends Error {
  public readonly code: string;

  constructor(code: string, message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = httpErrorTypes.client;
    this.code = code;
  }
}

export class NetworkError extends HttpClientError {
  constructor(options?: ErrorOptions) {
    super(
      requestErrors.fetchFailed.code,
      requestErrors.fetchFailed.message,
      options,
    );
    this.name = httpErrorTypes.network;
  }
}

export class TimeoutError extends HttpClientError {
  constructor(options?: ErrorOptions) {
    super(
      requestErrors.requestTimeout.code,
      requestErrors.requestTimeout.message,
      options,
    );
    this.name = httpErrorTypes.timeout;
  }
}

export class HttpError extends HttpClientError {
  public readonly status: number;
  public readonly statusText: string;
  public readonly rawData?: string;
  public readonly data?: unknown;

  constructor(
    status: number,
    statusText: string,
    rawData?: string,
    data?: unknown,
    options?: ErrorOptions,
  ) {
    super(
      responseErrors.httpError.code,
      responseErrors.httpError.message(status, statusText),
      options,
    );
    this.name = httpErrorTypes.base;
    this.status = status;
    this.statusText = statusText;
    this.rawData = rawData;
    this.data = data;
  }
}
