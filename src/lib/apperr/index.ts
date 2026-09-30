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
    this.timestamp =
      (!isString && options.timestamp) || new Date().toISOString();

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
      cause:
        this.cause instanceof Error
          ? {
              name: this.cause.name,
              message: this.cause.message,
              stack: this.cause.stack,
            }
          : this.cause,
    };
  }
}
