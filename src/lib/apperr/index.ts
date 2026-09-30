export interface BaseErrorOptions {
  message: string;
  cause?: unknown;
  timestamp?: string;
}

export class BaseError extends Error {
  public readonly timestamp: string;

  constructor(options: string | BaseErrorOptions) {
    const message = typeof options === "string" ? options : options.message;
    const cause = typeof options === "string" ? undefined : options.cause;
    const timestamp =
      typeof options === "string" ? undefined : options.timestamp;

    super(message, { cause });

    this.name = this.constructor.name;
    this.timestamp = timestamp ?? new Date().toISOString();

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  public toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      timestamp: this.timestamp,
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

export interface AppErrorOptions {
  code: string;
  message: string;
  context?: Record<string, unknown>;
  cause?: unknown;
  timestamp?: string;
}

export class AppError extends BaseError {
  public readonly code: string;
  public readonly context?: Record<string, unknown>;

  constructor(options: AppErrorOptions) {
    super({
      message: options.message,
      cause: options.cause,
      timestamp: options.timestamp,
    });

    this.code = options.code;
    this.context = options.context;
  }

  public override toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      code: this.code,
      context: this.context,
    };
  }
}
