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
  // Runtime Execution
  REQUEST_ABORTED: "REQUEST_ABORTED",
  REQUEST_TIMEOUT: "REQUEST_TIMEOUT",
  MAX_RETRIES_EXCEEDED: "MAX_RETRIES_EXCEEDED",
  NETWORK_DISCONNECTED: "NETWORK_DISCONNECTED",

  // Data & Serialization
  SERIALIZATION_ERROR: "SERIALIZATION_ERROR",
  INVALID_RESPONSE_HEADER: "INVALID_RESPONSE_HEADER",

  // Circuit Breaker & Lifecycle
  CASCADE_LOOP_DETECTED: "CASCADE_LOOP_DETECTED",
  UNEXPECTED_ERROR: "UNEXPECTED_ERROR",
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
  [REQUEST_ERROR_CODES.NETWORK_DISCONNECTED]:
    "Failed to execute network request due to lack of connectivity.",
  [REQUEST_ERROR_CODES.SERIALIZATION_ERROR]:
    "Failed to serialize request payload to JSON.",
  [REQUEST_ERROR_CODES.INVALID_RESPONSE_HEADER]:
    "The response header format was invalid or unparseable.",
  [REQUEST_ERROR_CODES.CASCADE_LOOP_DETECTED]:
    "Request execution loop detected and aborted by circuit breaker.",
  [REQUEST_ERROR_CODES.UNEXPECTED_ERROR]:
    "An unhandled error occurred during request execution.",
};

export const VALIDATION_ERROR_CODES = {
  RESPONSE_PARSE_ERROR: "RESPONSE_PARSE_ERROR",
  RESPONSE_VALIDATION_ERROR: "RESPONSE_VALIDATION_ERROR",
} as const;

export type ValidationErrorCode =
  (typeof VALIDATION_ERROR_CODES)[keyof typeof VALIDATION_ERROR_CODES];

export const VALIDATION_ERROR_MESSAGES: Record<ValidationErrorCode, string> = {
  [VALIDATION_ERROR_CODES.RESPONSE_PARSE_ERROR]:
    "The server returned a success status code, but the body content was malformed or non-JSON.",
  [VALIDATION_ERROR_CODES.RESPONSE_VALIDATION_ERROR]:
    "The server response body did not match the expected API schema contract.",
};
