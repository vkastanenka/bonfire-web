import { ZodError } from "zod";
import { BaseError, AppError } from "@/lib"; // Assuming BaseError and AppError are exported here

// ============================================================================
// 0. Error Constants
// ============================================================================

export const CLIENT_ERROR_CODES = {
  // Config & Setup
  MISSING_FETCH: "MISSING_FETCH",
  INVALID_BASE_URL: "INVALID_BASE_URL",
  INVALID_CONFIG: "INVALID_CONFIG",
  INVALID_TIMEOUT: "INVALID_TIMEOUT",
  INVALID_MAX_ATTEMPTS: "INVALID_MAX_ATTEMPTS",

  // Runtime Execution
  REQUEST_ABORTED: "REQUEST_ABORTED",
  REQUEST_TIMEOUT: "REQUEST_TIMEOUT",
  MAX_RETRIES_EXCEEDED: "MAX_RETRIES_EXCEEDED",
  NETWORK_DISCONNECTED: "NETWORK_DISCONNECTED",

  // Data & Serialization
  SERIALIZATION_ERROR: "SERIALIZATION_ERROR",
  INVALID_RESPONSE_HEADER: "INVALID_RESPONSE_HEADER",

  // Circuit Breaker & Lifecycle
  CASCADE_LOOP_DETECTED: "CASCADE_LOOP_DETECTED",
  UNEXPECTED_ERROR: "UNEXPECTED_ERROR",
} as const;

export type ClientErrorCode =
  (typeof CLIENT_ERROR_CODES)[keyof typeof CLIENT_ERROR_CODES];

export const CLIENT_ERROR_MESSAGES: Record<ClientErrorCode, string> = {
  [CLIENT_ERROR_CODES.MISSING_FETCH]:
    "No fetch implementation found in environment, and none provided in config.",
  [CLIENT_ERROR_CODES.INVALID_BASE_URL]:
    "A valid, non-empty baseUrl must be provided in client config.",
  [CLIENT_ERROR_CODES.INVALID_CONFIG]:
    "The provided client configuration is invalid or corrupted.",
  [CLIENT_ERROR_CODES.INVALID_TIMEOUT]:
    "Client timeout must be a positive number greater than 0ms.",
  [CLIENT_ERROR_CODES.INVALID_MAX_ATTEMPTS]:
    "Client maxAttempts must be an integer greater than or equal to 1.",
  [CLIENT_ERROR_CODES.REQUEST_ABORTED]:
    "The request was explicitly aborted by an AbortController.",
  [CLIENT_ERROR_CODES.REQUEST_TIMEOUT]:
    "The request timed out before receiving a response.",
  [CLIENT_ERROR_CODES.MAX_RETRIES_EXCEEDED]:
    "Maximum retry attempts reached without a successful response.",
  [CLIENT_ERROR_CODES.NETWORK_DISCONNECTED]:
    "Failed to execute network request due to lack of connectivity.",
  [CLIENT_ERROR_CODES.SERIALIZATION_ERROR]:
    "Failed to serialize request payload to JSON.",
  [CLIENT_ERROR_CODES.INVALID_RESPONSE_HEADER]:
    "The response header format was invalid or unparseable.",
  [CLIENT_ERROR_CODES.CASCADE_LOOP_DETECTED]:
    "Request execution loop detected and aborted by circuit breaker.",
  [CLIENT_ERROR_CODES.UNEXPECTED_ERROR]:
    "An unhandled error occurred during request execution.",
};

// ============================================================================
// 1. HTTP Canonical Status Map
// ============================================================================

interface StatusError {
  status: string;
  message: string;
}

export const STATUS_ERRORS: Record<number, StatusError> = {
  0: {
    status: "UNAVAILABLE",
    message:
      "Network connection failed. Please verify your internet connection.",
  },
  400: { status: "INVALID_ARGUMENT", message: "Bad request payload." },
  401: {
    status: "UNAUTHENTICATED",
    message: "Authentication credentials required or expired.",
  },
  403: {
    status: "PERMISSION_DENIED",
    message: "Permission denied for this resource.",
  },
  404: { status: "NOT_FOUND", message: "Requested resource not found." },
  409: {
    status: "ALREADY_EXISTS",
    message: "Resource already exists or state conflicted.",
  },
  412: {
    status: "FAILED_PRECONDITION",
    message: "Precondition failed. Please refresh.",
  },
  429: {
    status: "RESOURCE_EXHAUSTED",
    message: "Rate limit or quota exceeded.",
  },
  499: { status: "CANCELLED", message: "Request was cancelled by client." },
  500: { status: "INTERNAL", message: "An internal server error occurred." },
  501: { status: "UNIMPLEMENTED", message: "Feature is not supported." },
  503: { status: "UNAVAILABLE", message: "Service temporarily unavailable." },
  504: { status: "DEADLINE_EXCEEDED", message: "Upstream request timed out." },
};

// ============================================================================
// 2. Google AIP-193 Protobuf Payload Definitions
// ============================================================================

export interface ErrorInfoDetail {
  "@type": "type.googleapis.com/google.rpc.ErrorInfo" | string;
  reason: string;
  domain: string;
  metadata?: Record<string, string>;
}

export interface RetryInfoDetail {
  "@type": "type.googleapis.com/google.rpc.RetryInfo" | string;
  retryDelay?: string;
}

export interface DebugInfoDetail {
  "@type": "type.googleapis.com/google.rpc.DebugInfo" | string;
  detail?: string;
  stackEntries?: string[];
}

export interface FieldViolation {
  field: string;
  description: string;
  reason?: string;
}

export interface BadRequestDetail {
  "@type": "type.googleapis.com/google.rpc.BadRequest" | string;
  fieldViolations?: FieldViolation[];
}

export interface RequestInfoDetail {
  "@type": "type.googleapis.com/google.rpc.RequestInfo" | string;
  requestId: string;
  servingData?: string;
}

export interface ResourceInfoDetail {
  "@type": "type.googleapis.com/google.rpc.ResourceInfo" | string;
  resourceType: string;
  resourceName: string;
  owner?: string;
  description?: string;
}

export interface RawDetail {
  "@type": string;
  [key: string]: unknown;
}

export type ErrorDetail =
  | ErrorInfoDetail
  | RetryInfoDetail
  | DebugInfoDetail
  | BadRequestDetail
  | RequestInfoDetail
  | ResourceInfoDetail
  | RawDetail;

export interface ApiErrorPayload {
  code: number;
  message: string;
  status: string;
  details?: ErrorDetail[];
}

// ============================================================================
// 3. Custom Error Classes Extending BaseError
// ============================================================================

/**
  Represents a remote HTTP response error structured according to Google AIP-193.
 */
export class ApiNetworkError extends BaseError {
  public readonly code: number;
  public readonly status: string;
  public readonly details: ErrorDetail[];

  constructor(err: ApiErrorPayload, cause?: unknown) {
    super({
      message: err.message,
      cause,
    });

    this.code = err.code;
    this.status = err.status;
    this.details = err.details ?? [];
  }

  public getDetail<T extends ErrorDetail>(typeSuffix: string): T | undefined {
    return this.details.find((d) => d["@type"]?.endsWith(typeSuffix)) as
      | T
      | undefined;
  }

  public getBadRequest(): BadRequestDetail | undefined {
    return this.getDetail<BadRequestDetail>("BadRequest");
  }

  public getErrorInfo(): ErrorInfoDetail | undefined {
    return this.getDetail<ErrorInfoDetail>("ErrorInfo");
  }

  public getRetryDelayMs(): number | undefined {
    const retry = this.getDetail<RetryInfoDetail>("RetryInfo");
    if (!retry?.retryDelay) return undefined;
    const seconds = parseFloat(retry.retryDelay.replace("s", ""));
    return isNaN(seconds) ? undefined : seconds * 1000;
  }

  public isValidationFailure(): boolean {
    return (
      this.status === STATUS_ERRORS[400]?.status ||
      (this.getBadRequest()?.fieldViolations?.length ?? 0) > 0
    );
  }

  public getFieldError(fieldName: string): string | undefined {
    const violation = this.getBadRequest()?.fieldViolations?.find(
      (v) => v.field === fieldName,
    );
    return violation ? violation.description || violation.reason : undefined;
  }

  public toJSON() {
    return {
      name: this.name,
      code: this.code,
      status: this.status,
      message: this.message,
      timestamp: this.timestamp,
      details: this.details,
      stack: this.stack,
      cause: this.cause,
    };
  }
}

/**
  Thrown when an API response succeeds over the network but fails client runtime schema parsing.
 */
export class ResponseValidationError extends BaseError {
  public readonly zodError: ZodError;

  constructor(zodError: ZodError, message = "Response validation failed.") {
    super({
      message,
      cause: zodError,
    });

    this.zodError = zodError;
  }

  public toJSON() {
    return {
      name: this.name,
      message: this.message,
      timestamp: this.timestamp,
      issues: this.zodError.issues,
      stack: this.stack,
    };
  }
}

// ============================================================================
// 4. Client Circuit Breaker Helper (Uses AppError)
// ============================================================================

export function newCascadeLoopError(url: URL): AppError {
  return new AppError({
    code: "CASCADE_LOOP_DETECTED",
    message:
      "Request Cascade Loop Detected: The execution loop was terminated to prevent a stack overflow.",
    context: {
      url: url.toString(),
    },
  });
}

// ============================================================================
// 5. Utility Functions & Type Guards
// ============================================================================

export function isApiErrorPayload(data: unknown): data is ApiErrorPayload {
  return (
    typeof data === "object" &&
    data !== null &&
    typeof (data as Record<string, unknown>).code === "number" &&
    typeof (data as Record<string, unknown>).status === "string" &&
    typeof (data as Record<string, unknown>).message === "string"
  );
}

export const mapFetchToApiErrorPayload = (
  response: Response,
  data: unknown,
  url: string,
): ApiErrorPayload => {
  if (isApiErrorPayload(data)) {
    return data;
  }

  const fallback = STATUS_ERRORS[response.status] || {
    status: "UNKNOWN",
    message: `The server responded with an unhandled HTTP status code (${response.status}).`,
  };

  return {
    code: response.status,
    status: fallback.status,
    message: fallback.message,
    details: [
      {
        "@type": "type.googleapis.com/google.rpc.ErrorInfo",
        reason: fallback.status,
        domain: "http.response",
        metadata: {
          instance: url,
          timestamp: new Date().toISOString(),
        },
      } satisfies ErrorInfoDetail,
    ],
  };
};
