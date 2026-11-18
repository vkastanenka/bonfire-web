export type LogContext = Record<string, unknown>;

export interface Logger {
  debug(message: string, context?: LogContext): void;
  info(message: string, context?: LogContext): void;
  warn(message: string, context?: LogContext): void;
  error(message: string, context?: LogContext): void;
  child?(context: LogContext): Logger;
}

export interface LogOptions {
  logger?: Logger;
  logging?: boolean;
}

export const resolveLogger = (options?: LogOptions, context?: LogContext) => {
  let logger: Logger | undefined;

  if (options?.logger && options?.logging) {
    logger =
      options.logger.child && context
        ? options.logger.child(context)
        : options.logger;
  }

  return logger;
};
