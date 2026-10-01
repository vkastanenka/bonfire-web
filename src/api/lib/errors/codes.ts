export const API_ERROR_CODES = {
  TOKEN_EXPIRED: "TOKEN_EXPIRED",
} as const;

export type ApiErrorCode =
  (typeof API_ERROR_CODES)[keyof typeof API_ERROR_CODES];

export const CLIENT_ERROR_CODES = {
  MISSING_FETCH: "MISSING_FETCH",
  INVALID_BASE_URL: "INVALID_BASE_URL",
  INVALID_TIMEOUT: "INVALID_TIMEOUT",
  INVALID_MAX_ATTEMPTS: "INVALID_MAX_ATTEMPTS",
} as const;

export type ClientErrorCode =
  (typeof CLIENT_ERROR_CODES)[keyof typeof CLIENT_ERROR_CODES];

export const CLIENT_ERROR_MESSAGES: Record<ClientErrorCode, string> = {
  [CLIENT_ERROR_CODES.MISSING_FETCH]:
    "No fetch implementation found in environment, and none provided in config.",
  [CLIENT_ERROR_CODES.INVALID_BASE_URL]:
    "A valid, non-empty baseUrl must be provided in client config.",
  [CLIENT_ERROR_CODES.INVALID_TIMEOUT]:
    "Client timeout must be a positive number greater than 0ms.",
  [CLIENT_ERROR_CODES.INVALID_MAX_ATTEMPTS]:
    "Client maxAttempts must be an integer greater than or equal to 1.",
};

export const REQUEST_ERROR_CODES = {
  REQUEST_ABORTED: "REQUEST_ABORTED",
  REQUEST_TIMEOUT: "REQUEST_TIMEOUT",
  MAX_RETRIES_EXCEEDED: "MAX_RETRIES_EXCEEDED",
  FETCH_FAILED: "FETCH_FAILED",
  TOKEN_REFRESH_FAILED: "TOKEN_REFRESH_FAILED",
} as const;

export type RequestErrorCode =
  (typeof REQUEST_ERROR_CODES)[keyof typeof REQUEST_ERROR_CODES];

export const REQUEST_ERROR_MESSAGES: Record<RequestErrorCode, string> = {
  [REQUEST_ERROR_CODES.REQUEST_ABORTED]:
    "The request was explicitly aborted by an AbortController.",
  [REQUEST_ERROR_CODES.REQUEST_TIMEOUT]:
    "The request timed out before receiving a response.",
  [REQUEST_ERROR_CODES.MAX_RETRIES_EXCEEDED]:
    "Maximum retry attempts reached without a successful response.",
  [REQUEST_ERROR_CODES.FETCH_FAILED]:
    "The network request failed before reaching the server.",
  [REQUEST_ERROR_CODES.TOKEN_REFRESH_FAILED]:
    "Failed to refresh authentication token.",
};

export const RESPONSE_ERROR_CODES = {
  PARSE_ERROR: "PARSE_ERROR",
  VALIDATION_ERROR: "VALIDATION_ERROR",
} as const;

export type ValidationErrorCode =
  (typeof RESPONSE_ERROR_CODES)[keyof typeof RESPONSE_ERROR_CODES];

export const VALIDATION_ERROR_MESSAGES: Record<ValidationErrorCode, string> = {
  [RESPONSE_ERROR_CODES.PARSE_ERROR]:
    "The server returned a success status code, but the body content was malformed or non-JSON.",
  [RESPONSE_ERROR_CODES.VALIDATION_ERROR]:
    "The server response body did not match the expected API schema contract.",
};
