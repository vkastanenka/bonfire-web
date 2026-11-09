export const apiErrorCodes = {
  tokenExpired: "TOKEN_EXPIRED",
  rateLimitExceeded: "RATE_LIMIT_EXCEEDED",
} as const;

export type ApiErrorCode = (typeof apiErrorCodes)[keyof typeof apiErrorCodes];

export const clientErrors = {
  missingFetch: {
    code: "MISSING_FETCH",
    message:
      "No fetch implementation found in environment, and none provided in config.",
  },
  invalidBaseUrl: {
    code: "INVALID_BASE_URL",
    message: "A valid, non-empty baseUrl must be provided in client config.",
  },
  invalidTimeout: {
    code: "INVALID_TIMEOUT",
    message: "Client timeout must be a positive number greater than 0ms.",
  },
  invalidMaxAttempts: {
    code: "INVALID_MAX_ATTEMPTS",
    message:
      "Client maxAttempts must be an integer greater than or equal to 1.",
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
  tokenRefreshFailed: {
    code: "TOKEN_REFRESH_FAILED",
    message: "Failed to refresh authentication token.",
  },
} as const;

export type RequestErrorCode =
  (typeof requestErrors)[keyof typeof requestErrors]["code"];

export const responseErrors = {
  parseError: {
    code: "PARSE_ERROR",
    message:
      "The server returned a success status code, but the body content was malformed or non-JSON.",
  },
  validationError: {
    code: "VALIDATION_ERROR",
    message:
      "The server response body did not match the expected API schema contract.",
  },
} as const;

export type ResponseErrorCode =
  (typeof responseErrors)[keyof typeof responseErrors]["code"];
