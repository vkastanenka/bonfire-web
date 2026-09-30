export const LOG_LEVELS = {
  DEBUG: "debug",
  INFO: "info",
  WARN: "warn",
  ERROR: "error",
} as const;

export type LogLevel = (typeof LOG_LEVELS)[keyof typeof LOG_LEVELS];

const LOG_LEVEL_WEIGHTS: Record<LogLevel, number> = {
  [LOG_LEVELS.DEBUG]: 0,
  [LOG_LEVELS.INFO]: 1,
  [LOG_LEVELS.WARN]: 2,
  [LOG_LEVELS.ERROR]: 3,
};

export type LogContext = Record<string, unknown>;

export class Logger {
  private minLevel: LogLevel;

  constructor(minLevel?: LogLevel) {
    const defaultLevel =
      process.env.NODE_ENV === "production"
        ? LOG_LEVELS.INFO
        : LOG_LEVELS.DEBUG;

    const envLevel = process.env.LOG_LEVEL?.toLowerCase() as
      | LogLevel
      | undefined;

    this.minLevel =
      minLevel ??
      (envLevel && envLevel in LOG_LEVEL_WEIGHTS ? envLevel : defaultLevel);
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVEL_WEIGHTS[level] >= LOG_LEVEL_WEIGHTS[this.minLevel];
  }

  private emit(level: LogLevel, message: string, context?: LogContext) {
    if (!this.shouldLog(level)) return;

    const payload = JSON.stringify(
      {
        level,
        message,
        timestamp: new Date().toISOString(),
        ...context,
      },
      (_key, value) => {
        if (value instanceof Error) {
          return {
            name: value.name,
            message: value.message,
            stack: value.stack,
          };
        }
        return value;
      },
    );

    switch (level) {
      case LOG_LEVELS.DEBUG:
        console.debug(payload);
        break;
      case LOG_LEVELS.INFO:
        console.info(payload);
        break;
      case LOG_LEVELS.WARN:
        console.warn(payload);
        break;
      case LOG_LEVELS.ERROR:
        console.error(payload);
        break;
    }
  }

  debug(message: string, context?: LogContext) {
    this.emit(LOG_LEVELS.DEBUG, message, context);
  }

  info(message: string, context?: LogContext) {
    this.emit(LOG_LEVELS.INFO, message, context);
  }

  warn(message: string, context?: LogContext) {
    this.emit(LOG_LEVELS.WARN, message, context);
  }

  error(message: string, context?: LogContext) {
    this.emit(LOG_LEVELS.ERROR, message, context);
  }
}
