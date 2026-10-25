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
  private defaultContext: LogContext;

  constructor(minLevel?: LogLevel, defaultContext: LogContext = {}) {
    let isProduction = false;

    try {
      if (
        typeof process !== "undefined" &&
        process.env?.NODE_ENV === "production"
      ) {
        isProduction = true;
      }
    } catch {
      // Ignore
    }

    const defaultLevel = isProduction ? LOG_LEVELS.INFO : LOG_LEVELS.DEBUG;

    let envLevel: LogLevel | undefined;

    try {
      if (typeof process !== "undefined" && process.env?.LOG_LEVEL) {
        envLevel = process.env.LOG_LEVEL.toLowerCase() as LogLevel;
      }
    } catch {
      // Ignore
    }

    this.minLevel =
      minLevel ??
      (envLevel && envLevel in LOG_LEVEL_WEIGHTS ? envLevel : defaultLevel);

    this.defaultContext = defaultContext;
  }

  public child(context: LogContext): Logger {
    return new Logger(this.minLevel, {
      ...this.defaultContext,
      ...context,
    });
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVEL_WEIGHTS[level] >= LOG_LEVEL_WEIGHTS[this.minLevel];
  }

  private emit(level: LogLevel, message: string, context?: LogContext) {
    if (!this.shouldLog(level)) return;

    const payload = {
      ...this.defaultContext,
      ...context,
      level,
      message,
      timestamp: new Date().toISOString(),
    };

    const cleanPayload = JSON.parse(
      JSON.stringify(payload, (_key, value) => {
        if (value instanceof Error) {
          return "toJSON" in value && typeof value.toJSON === "function"
            ? value.toJSON()
            : { name: value.name, message: value.message, stack: value.stack };
        }
        return value;
      }),
    );

    switch (level) {
      case LOG_LEVELS.DEBUG:
        console.debug("🐛", message, cleanPayload);
        break;
      case LOG_LEVELS.INFO:
        console.info("ℹ️", message, cleanPayload);
        break;
      case LOG_LEVELS.WARN:
        console.warn("⚠️", message, cleanPayload);
        break;
      case LOG_LEVELS.ERROR:
        console.error("❌", message, cleanPayload);
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

export const logger = new Logger();
