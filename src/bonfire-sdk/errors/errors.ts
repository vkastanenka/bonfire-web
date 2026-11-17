export const apiErrorCodes = {
  tokenExpired: "TOKEN_EXPIRED",
} as const;

export type ApiErrorCode = (typeof apiErrorCodes)[keyof typeof apiErrorCodes];
