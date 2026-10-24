export interface AppErrorOptions {
  code?: string;
  message: string;
  context?: Record<string, unknown>;
  cause?: unknown;
  timestamp?: string;
}

export class AppError extends Error {
  public readonly code: string;
  public readonly context?: Record<string, unknown>;
  public readonly timestamp: string;

  constructor(options: string | AppErrorOptions) {
    const isString = typeof options === "string";
    const message = isString ? options : options.message;
    const cause = isString ? undefined : options.cause;

    super(message, { cause });

    this.name = this.constructor.name;
    this.code = isString ? "UNKNOWN_ERROR" : (options.code ?? "UNKNOWN_ERROR");
    this.context = isString ? undefined : options.context;

    let formattedTimestamp: string;
    try {
      formattedTimestamp =
        !isString && options.timestamp
          ? new Date(options.timestamp).toISOString()
          : new Date().toISOString();
    } catch {
      formattedTimestamp = new Date().toISOString();
    }

    this.timestamp = formattedTimestamp;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  public toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      timestamp: this.timestamp,
      context: this.context,
      stack: this.stack,
      cause: this.serializeCause(this.cause),
    };
  }

  private serializeCause(cause: unknown): unknown {
    if (!cause) return undefined;

    if (typeof (cause as { toJSON?: unknown }).toJSON === "function") {
      return (cause as { toJSON: () => unknown }).toJSON();
    }

    if (cause instanceof Error) {
      return {
        name: cause.name,
        message: cause.message,
        stack: cause.stack,
      };
    }

    return cause;
  }
}
