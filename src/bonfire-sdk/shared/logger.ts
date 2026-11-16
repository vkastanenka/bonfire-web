export const logMessages = {
  initiated: "HTTP request initiated.",
  succeeded: "HTTP request succeeded.",
  failed: "HTTP request failed.",
  retrying: "Retrying HTTP request.",
  responseValidationFailed: "Response contract validation failed.",
  authTokenExpired: "Access token expired. Attempting token refresh.",
  authRefreshSucceeded: "Token refresh succeeded. Retrying request.",
  authSessionCleared: "Authentication failed. Clearing session tokens.",
} as const;

export type LogContext = Record<string, unknown>;

export interface Logger {
  debug(message: string, context?: LogContext): void;
  info(message: string, context?: LogContext): void;
  warn(message: string, context?: LogContext): void;
  error(message: string, context?: LogContext): void;
  child?(context: LogContext): Logger;
}

export const logger: Logger = {
  debug: () => {},
  info: () => {},
  warn: () => {},
  error: () => {},
  child: () => logger,
};
