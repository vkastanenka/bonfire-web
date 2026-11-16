import { HttpClient } from "@/http";

export abstract class BaseService {
  protected readonly httpClient: HttpClient;

  constructor(httpClient: HttpClient) {
    this.httpClient = httpClient;
  }

  /**
   * TODO: AIP error mapping
   */

  // protected async execute<T>(
  //   requestFn: () => Promise<T>,
  //   urlPath?: string,
  // ): Promise<T> {
  //   try {
  //     return await requestFn();
  //   } catch (error) {
  //     if (error instanceof AipError || error instanceof AppError) {
  //       throw error;
  //     }

  //     if (error instanceof HttpError) {
  //       const fullUrl = urlPath
  //         ? `${this.httpClient.config.baseUrl}${urlPath}`
  //         : this.httpClient.config.baseUrl;
  //       throw toAipError(error, fullUrl);
  //     }

  //     throw error;
  //   }
  // }

  /**
   * TODO: Schema validation
   */

  //   if (!options.schema) {
  //   return parsedResponse.data as T;
  // }

  // const parsed = options.schema.safeParse(parsedResponse.data);

  // if (!parsed.success) {
  //   const issueSummary = parsed.error.issues
  //     .map((issue) => `${issue.path.join(".") || "root"}: ${issue.message}`)
  //     .join("; ");

  //   throw new HttpClientError(
  //     responseErrors.validationError.code,
  //     `${responseErrors.validationError.message} ${issueSummary}`,
  //     { cause: parsed.error },
  //   );
  // }
}

// export const responseErrors = {
//   httpError: {
//     code: "HTTP_ERROR",
//     message: (status: number, statusText: string) =>
//       `HTTP error status: ${status}${statusText ? ` ${statusText}` : ""}`,
//   },
//   parseError: {
//     code: "PARSE_ERROR",
//     message:
//       "The server returned a success status code, but the body content was malformed or non-JSON.",
//   },
//   validationError: {
//     code: "VALIDATION_ERROR",
//     message:
//       "The server response body did not match the expected API schema contract.",
//   },
// } as const;

// export type ResponseErrorCode =
//   (typeof responseErrors)[keyof typeof responseErrors]["code"];

// export const attachRequestLogger = (client: HttpClient, logger: Logger): void => {
//   client.addBeforeRequest((options, context) => {
//     logger.debug("HTTP request initiated", {
//       requestId: context.requestId,
//       method: options.method,
//       url: options.url,
//     });
//   });

//   client.addResponseSuccess((options, context) => {
//     logger.debug("HTTP request succeeded", {
//       requestId: context.requestId,
//       method: options.method,
//       url: options.url,
//       attemptCount: context.attemptCount,
//       durationMs: Math.round(performance.now() - context.startTime),
//     });
//   });

//   client.addResponseError((options, context, error) => {
//     const isHttpError = error instanceof HttpError;
//     const isFinalAttempt = context.attemptCount >= options.retry.maxAttempts;
//     const log = isFinalAttempt ? logger.error.bind(logger) : logger.debug.bind(logger);

//     log("HTTP request failed", {
//       requestId: context.requestId,
//       method: options.method,
//       url: options.url,
//       attemptCount: context.attemptCount,
//       durationMs: Math.round(performance.now() - context.startTime),
//       status: isHttpError ? error.status : 0,
//       errorName: error instanceof Error ? error.name : "UnknownError",
//     });
//   });
// };

// context.logger?.debug("Request initiated", {
//   requestId: context.requestId,
//   attemptCount: context.attemptCount,
// });

// context.logger?.debug("Request succeeded", {
//   requestId: context.requestId,
//   durationMs: Math.round(performance.now() - context.startTime),
// });

// context.logger?.debug("Retrying request", {
//   requestId: context.requestId,
//   delayMs,
// });

// tokenRefreshFailed: {
//   code: "TOKEN_REFRESH_FAILED",
//   message: "Failed to refresh authentication token.",
// },
