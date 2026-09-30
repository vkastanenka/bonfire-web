export const STATUS_CODES = {
  NETWORK_ERROR: 0,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  PRECONDITION_FAILED: 412,
  TOO_MANY_REQUESTS: 429,
  CLIENT_CLOSED_REQUEST: 499,
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
} as const;

export type StatusCode = (typeof STATUS_CODES)[keyof typeof STATUS_CODES];

export const STATUS_NAMES: Record<StatusCode, string> = {
  [STATUS_CODES.NETWORK_ERROR]: "UNAVAILABLE",
  [STATUS_CODES.BAD_REQUEST]: "INVALID_ARGUMENT",
  [STATUS_CODES.UNAUTHORIZED]: "UNAUTHENTICATED",
  [STATUS_CODES.FORBIDDEN]: "PERMISSION_DENIED",
  [STATUS_CODES.NOT_FOUND]: "NOT_FOUND",
  [STATUS_CODES.CONFLICT]: "ALREADY_EXISTS",
  [STATUS_CODES.PRECONDITION_FAILED]: "FAILED_PRECONDITION",
  [STATUS_CODES.TOO_MANY_REQUESTS]: "RESOURCE_EXHAUSTED",
  [STATUS_CODES.CLIENT_CLOSED_REQUEST]: "CANCELLED",
  [STATUS_CODES.INTERNAL_SERVER_ERROR]: "INTERNAL",
  [STATUS_CODES.NOT_IMPLEMENTED]: "UNIMPLEMENTED",
  [STATUS_CODES.BAD_GATEWAY]: "UNAVAILABLE",
  [STATUS_CODES.SERVICE_UNAVAILABLE]: "UNAVAILABLE",
  [STATUS_CODES.GATEWAY_TIMEOUT]: "DEADLINE_EXCEEDED",
};

export const STATUS_MESSAGES: Record<StatusCode, string> = {
  [STATUS_CODES.NETWORK_ERROR]:
    "The service is currently unavailable. Please check your network connection.",
  [STATUS_CODES.BAD_REQUEST]: "The client specified an invalid argument.",
  [STATUS_CODES.UNAUTHORIZED]:
    "The request does not have valid authentication credentials for the operation.",
  [STATUS_CODES.FORBIDDEN]:
    "The caller does not have permission to execute the specified operation.",
  [STATUS_CODES.NOT_FOUND]: "The requested resource was not found.",
  [STATUS_CODES.CONFLICT]:
    "The resource that the client attempted to create already exists.",
  [STATUS_CODES.PRECONDITION_FAILED]:
    "The operation was rejected because the system is not in a state required for execution.",
  [STATUS_CODES.TOO_MANY_REQUESTS]:
    "A resource limit or quota has been exceeded.",
  [STATUS_CODES.CLIENT_CLOSED_REQUEST]: "The operation was cancelled.",
  [STATUS_CODES.INTERNAL_SERVER_ERROR]: "An internal error occurred.",
  [STATUS_CODES.NOT_IMPLEMENTED]:
    "The operation is not implemented or supported in this service.",
  [STATUS_CODES.BAD_GATEWAY]:
    "The service is currently unavailable. Upstream gateway failed.",
  [STATUS_CODES.SERVICE_UNAVAILABLE]:
    "The service is currently unavailable. Please try again later.",
  [STATUS_CODES.GATEWAY_TIMEOUT]:
    "The deadline expired before the operation could complete.",
};
