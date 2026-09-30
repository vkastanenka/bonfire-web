export type LogContext = Record<string, unknown>;

export interface Logger {
  debug(message: string, context?: LogContext): void;
  info(message: string, context?: LogContext): void;
  warn(message: string, context?: LogContext): void;
  error(message: string, context?: LogContext): void;
}

export const REQUEST_LOGS = {
  INITIATED: "HTTP request initiated.",
  SUCCEEDED: "HTTP request succeeded.",
  FAILED: "HTTP request failed.",
  RETRYING: "Retrying HTTP request.",
  RESPONSE_VALIDATION_FAILED: "Response contract validation failed.",
} as const;
