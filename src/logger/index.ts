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

const EMOJI_MAP: Record<LogLevel, string> = {
  [LOG_LEVELS.DEBUG]: "🐛",
  [LOG_LEVELS.INFO]: "ℹ️",
  [LOG_LEVELS.WARN]: "⚠️",
  [LOG_LEVELS.ERROR]: "❌",
};

export class Logger {
  private minLevel: LogLevel;
  private defaultContext: LogContext;

  constructor(minLevel?: LogLevel, defaultContext: LogContext = {}) {
    let isProduction = false;
    if (process?.env?.NODE_ENV === "production") {
      isProduction = true;
    }

    const defaultLevel = isProduction ? LOG_LEVELS.INFO : LOG_LEVELS.DEBUG;
    let envLevel: LogLevel | undefined;

    if (process?.env?.LOG_LEVEL) {
      envLevel = process.env.LOG_LEVEL.toLowerCase() as LogLevel;
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

    const mergedContext = {
      ...this.defaultContext,
      ...context,
    };

    const rawPayload = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...(Object.keys(mergedContext).length > 0
        ? { context: mergedContext }
        : {}),
    };

    const cleanPayload = JSON.parse(
      JSON.stringify(rawPayload, (_key, value) => {
        if (value instanceof Error) {
          return "toJSON" in value && typeof value.toJSON === "function"
            ? value.toJSON()
            : { name: value.name, message: value.message, stack: value.stack };
        }
        return value;
      }),
    );

    const consoleArgs = [EMOJI_MAP[level], message];
    if (cleanPayload.context) {
      consoleArgs.push(cleanPayload.context);
    }

    switch (level) {
      case LOG_LEVELS.DEBUG:
        console.debug(...consoleArgs);
        break;
      case LOG_LEVELS.INFO:
        console.info(...consoleArgs);
        break;
      case LOG_LEVELS.WARN:
        console.warn(...consoleArgs);
        break;
      case LOG_LEVELS.ERROR:
        console.error(...consoleArgs);
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
