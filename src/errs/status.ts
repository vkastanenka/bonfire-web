export const statusCodes = {
  networkError: 0,
  badRequest: 400,
  unauthorized: 401,
  forbidden: 403,
  notFound: 404,
  conflict: 409,
  preconditionFailed: 412,
  tooManyRequests: 429,
  clientClosedRequest: 499,
  internalServerError: 500,
  notImplemented: 501,
  badGateway: 502,
  serviceUnavailable: 503,
  gatewayTimeout: 504,
} as const;

export type StatusCode = (typeof statusCodes)[keyof typeof statusCodes];

export const statusNames: Record<StatusCode, string> = {
  [statusCodes.networkError]: "UNAVAILABLE",
  [statusCodes.badRequest]: "INVALID_ARGUMENT",
  [statusCodes.unauthorized]: "UNAUTHENTICATED",
  [statusCodes.forbidden]: "PERMISSION_DENIED",
  [statusCodes.notFound]: "NOT_FOUND",
  [statusCodes.conflict]: "ALREADY_EXISTS",
  [statusCodes.preconditionFailed]: "FAILED_PRECONDITION",
  [statusCodes.tooManyRequests]: "RESOURCE_EXHAUSTED",
  [statusCodes.clientClosedRequest]: "CANCELLED",
  [statusCodes.internalServerError]: "INTERNAL",
  [statusCodes.notImplemented]: "UNIMPLEMENTED",
  [statusCodes.badGateway]: "UNAVAILABLE",
  [statusCodes.serviceUnavailable]: "UNAVAILABLE",
  [statusCodes.gatewayTimeout]: "DEADLINE_EXCEEDED",
};

export const statusMessages: Record<StatusCode, string> = {
  [statusCodes.networkError]:
    "The service is currently unavailable. Please check your network connection.",
  [statusCodes.badRequest]: "The client specified an invalid argument.",
  [statusCodes.unauthorized]:
    "The request does not have valid authentication credentials for the operation.",
  [statusCodes.forbidden]:
    "The caller does not have permission to execute the specified operation.",
  [statusCodes.notFound]: "The requested resource was not found.",
  [statusCodes.conflict]:
    "The resource that the client attempted to create already exists.",
  [statusCodes.preconditionFailed]:
    "The operation was rejected because the system is not in a state required for execution.",
  [statusCodes.tooManyRequests]: "A resource limit or quota has been exceeded.",
  [statusCodes.clientClosedRequest]: "The operation was cancelled.",
  [statusCodes.internalServerError]: "An internal error occurred.",
  [statusCodes.notImplemented]:
    "The operation is not implemented or supported in this service.",
  [statusCodes.badGateway]:
    "The service is currently unavailable. Upstream gateway failed.",
  [statusCodes.serviceUnavailable]:
    "The service is currently unavailable. Please try again later.",
  [statusCodes.gatewayTimeout]:
    "The deadline expired before the operation could complete.",
};

export const retryableStatusCodes: ReadonlySet<number> = new Set([
  statusCodes.badGateway,
  statusCodes.serviceUnavailable,
  statusCodes.gatewayTimeout,
]);
