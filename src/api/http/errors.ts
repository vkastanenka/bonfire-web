import { ZodError } from "zod";

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

export const API_ERROR_CODES = {
  TOKEN_EXPIRED: "TOKEN_EXPIRED",
  INVALID_INPUT: "INVALID_INPUT",
} as const;

export type ApiErrorCode =
  (typeof API_ERROR_CODES)[keyof typeof API_ERROR_CODES];

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

export interface AppError {
  code: number;
  message: string;
  status: string;
  details?: ErrorDetail[];
}

export class ApiNetworkError extends Error {
  public readonly code: number;
  public readonly status: string;
  public readonly details: ErrorDetail[];

  constructor(err: AppError) {
    super(err.message);
    this.name = "ApiNetworkError";
    this.code = err.code;
    this.status = err.status;
    this.details = err.details ?? [];
    Object.setPrototypeOf(this, ApiNetworkError.prototype);
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
      this.status === STATUS_ERRORS[400].status ||
      (this.getBadRequest()?.fieldViolations?.length ?? 0) > 0
    );
  }

  public getFieldError(fieldName: string): string | undefined {
    const violation = this.getBadRequest()?.fieldViolations?.find(
      (v) => v.field === fieldName,
    );
    return violation ? violation.description || violation.reason : undefined;
  }
}

export class ResponseValidationError extends Error {
  public readonly zodError: ZodError;
  constructor(zodError: ZodError, message: string) {
    super(message);
    this.name = "ResponseValidationError";
    this.zodError = zodError;
    Object.setPrototypeOf(this, ResponseValidationError.prototype);
  }
}

export function newCascadeLoopError(url: URL): ApiNetworkError {
  return new ApiNetworkError({
    code: 0,
    status: STATUS_ERRORS[0].status,
    message:
      "Request Cascade Loop Detected: The execution loop was terminated to prevent a stack overflow.",
    details: [
      {
        "@type": "type.googleapis.com/google.rpc.ErrorInfo",
        reason: "CASCADE_BREAKDOWN",
        domain: "client.circuit_breaker",
        metadata: {
          instance: url.toString(),
          timestamp: new Date().toISOString(),
          type: "https://api.com/errors/cascade-breakdown",
        },
      } satisfies ErrorInfoDetail,
    ],
  });
}

export function isAppError(data: unknown): data is AppError {
  return (
    typeof data === "object" &&
    data !== null &&
    typeof (data as Record<string, unknown>).code === "number" &&
    typeof (data as Record<string, unknown>).status === "string" &&
    typeof (data as Record<string, unknown>).message === "string"
  );
}

export const mapFetchToAppError = (
  response: Response,
  data: unknown,
  url: string,
): AppError => {
  if (isAppError(data)) {
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

export function getErrorInfoReason(error: AppError): string | undefined {
  if (!error.details) return undefined;

  const errorInfo = error.details.find((d): d is ErrorInfoDetail =>
    d["@type"]?.endsWith("ErrorInfo"),
  );

  return errorInfo?.reason;
}
