import type { AxiosError } from "axios";
import { ZodError } from "zod";

interface BackendErrorMetadata {
  code: string;
  title: string;
  detail: string;
}

export const BACKEND_ERROR_MAP: Record<number, BackendErrorMetadata> = {
  400: {
    code: "BAD_REQUEST",
    title: "Bad Request",
    detail: "The request payload or syntax is malformed.",
  },
  401: {
    code: "UNAUTHORIZED",
    title: "Unauthorized Access",
    detail: "The provided credentials are invalid or expired.",
  },
  403: {
    code: "FORBIDDEN",
    title: "Permission Denied",
    detail: "You lack the required permissions for this action.",
  },
  404: {
    code: "NOT_FOUND",
    title: "Resource Not Found",
    detail: "The requested resource could not be found.",
  },
  405: {
    code: "METHOD_NOT_ALLOWED",
    title: "Method Not Allowed",
    detail: "The HTTP method is not supported for this path.",
  },
  408: {
    code: "REQUEST_TIMEOUT",
    title: "Request Timeout",
    detail: "The execution timeout deadline was exceeded.",
  },
  409: {
    code: "CONFLICT",
    title: "Resource Conflict",
    detail: "The operation conflicted with the current state of a resource.",
  },
  410: {
    code: "GONE",
    title: "Resource No Longer Available",
    detail: "The requested resource has been permanently deleted.",
  },
  412: {
    code: "PRECONDITION_FAILED",
    title: "Precondition Failed",
    detail: "Target resource state has changed. Please refresh and retry.",
  },
  413: {
    code: "PAYLOAD_TOO_LARGE",
    title: "Payload Too Large",
    detail: "The request body exceeds the maximum size limit.",
  },
  415: {
    code: "UNSUPPORTED_MEDIA_TYPE",
    title: "Unsupported Media Type",
    detail: "Content-Type must be application/json.",
  },
  422: {
    code: "UNPROCESSABLE_ENTITY",
    title: "Unprocessable Entity",
    detail: "The request is valid but breaks semantic business logic rules.",
  },
  429: {
    code: "TOO_MANY_REQUESTS",
    title: "Too Many Requests",
    detail: "Rate limit exceeded. Please slow down.",
  },
  499: {
    code: "CLIENT_CLOSED_REQUEST",
    title: "Client Closed Connection",
    detail: "The client disconnected before processing completed.",
  },
  501: {
    code: "NOT_IMPLEMENTED",
    title: "Feature Not Implemented",
    detail: "This server capability is not yet supported.",
  },
  502: {
    code: "BAD_GATEWAY",
    title: "Bad Gateway",
    detail: "An upstream dependency returned an invalid response.",
  },
  503: {
    code: "SERVICE_UNAVAILABLE",
    title: "Service Temporarily Unavailable",
    detail: "The server is temporarily down for maintenance or overloaded.",
  },
  504: {
    code: "GATEWAY_TIMEOUT",
    title: "Gateway Timeout",
    detail: "An upstream dependency failed to respond in time.",
  },
};

export const DEFAULT_INTERNAL_ERROR: BackendErrorMetadata = {
  code: "INTERNAL",
  title: "Internal Server Error",
  detail: "An unexpected condition occurred on our servers.",
};

export interface InvalidParam {
  name: string;
  reason: string;
}

export interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
  code: string;
  invalid_params?: InvalidParam[];
  req_id: string;
  trace_id: string;
  timestamp: string;
}

export class ApiNetworkError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly details: ProblemDetails;

  constructor(details: ProblemDetails) {
    super(details.detail);
    this.name = "ApiNetworkError";
    this.status = details.status;
    this.code = details.code;
    this.details = details;
    Object.setPrototypeOf(this, ApiNetworkError.prototype);
  }

  public isValidationFailure(): boolean {
    return (
      this.code === "INVALID_INPUT" ||
      (Array.isArray(this.details.invalid_params) &&
        this.details.invalid_params.length > 0)
    );
  }

  public getFieldError(fieldName: string): string | undefined {
    return this.details.invalid_params?.find((p) => p.name === fieldName)
      ?.reason;
  }
}

export class ResponseValidationError extends Error {
  public readonly url: string;
  public readonly zodError: ZodError;
  constructor(zodError: ZodError, message: string, url: string) {
    super(message);
    this.name = "ResponseValidationError";
    this.url = url;
    this.zodError = zodError;
    Object.setPrototypeOf(this, ResponseValidationError.prototype);
  }
}

export function isProblemDetails(data: unknown): data is ProblemDetails {
  return (
    typeof data === "object" &&
    data !== null &&
    "code" in data &&
    "detail" in data &&
    "status" in data
  );
}

export const mapErrToProblem = (error: AxiosError<unknown>): ProblemDetails => {
  const errStatus = error.response?.status || 500;
  const errData = error.response?.data;

  if (isProblemDetails(errData)) {
    return errData;
  }

  const meta = BACKEND_ERROR_MAP[errStatus] || DEFAULT_INTERNAL_ERROR;
  const slug = meta.code.toLowerCase().replace(/_/g, "-");

  const headers = error.response?.headers;
  const getHeader = (key: string): string => {
    if (!headers) return "unknown";
    if (typeof headers.get === "function") {
      return String(headers.get(key) || "unknown");
    }
    return String((headers as Record<string, unknown>)[key] || "unknown");
  };

  return {
    type: `https://api.bonfire.com/errors/${slug}`,
    title: meta.title,
    status: errStatus,
    detail: error.message || meta.detail,
    code: meta.code,
    instance: error.config?.url || "unknown",
    req_id:
      getHeader("x-request-id") !== "unknown"
        ? getHeader("x-request-id")
        : getHeader("x-correlation-id"),
    trace_id: getHeader("x-b3-traceid"),
    timestamp: new Date().toISOString(),
  };
};
