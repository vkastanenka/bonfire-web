export * from "./aip";
export * from "./details";

export const apiErrorCodes = {
  tokenExpired: "TOKEN_EXPIRED",
  rateLimitExceeded: "RATE_LIMIT_EXCEEDED",
} as const;

export type ApiErrorCode = (typeof apiErrorCodes)[keyof typeof apiErrorCodes];
