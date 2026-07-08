import type { AxiosError } from "axios";
import { ZodError } from "zod";

interface StatusError {
  code: string;
  title: string;
  detail: string;
}

export const STATUS_ERRORS: Record<number, StatusError> = {
  0: {
    code: "NETWORK_OFFLINE",
    title: "Network Connection Failed",
    detail:
      "Unable to connect to the server. Please verify your internet connection.",
  },
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
  500: {
    code: "INTERNAL",
    title: "Internal Server Error",
    detail: "An unexpected condition occurred on our servers.",
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

export const mapErrorToProblem = (
  error: AxiosError<unknown>,
): ProblemDetails => {
  if (error.response && isProblemDetails(error.response.data)) {
    return error.response.data;
  }

  const isLocalError = !error.response;
  const isTimeout =
    isLocalError &&
    (error.code === "ECONNABORTED" || error.message.includes("timeout"));
  const errStatus = error.response
    ? error.response.status
    : isTimeout
      ? 408
      : 0;

  const statusErr = STATUS_ERRORS[errStatus] || {
    code: "UNKNOWN_HTTP_ERROR",
    title: "Unexpected Network Response",
    detail: `The server responded with an unhandled status code (${errStatus}).`,
  };

  const headers = error.response?.headers;
  const getHeader = (key: string): string => {
    if (!headers) return "unknown";
    const value =
      typeof headers.get === "function"
        ? headers.get(key)
        : (headers as Record<string, unknown>)[key];
    return String(value || "unknown");
  };

  const detail = isLocalError
    ? isTimeout
      ? "The connection timed out before receiving a response from the server."
      : statusErr.detail
    : error.message || statusErr.detail;

  const slug = statusErr.code.toLowerCase().replace(/_/g, "-");
  const reqId = getHeader("x-request-id");

  return {
    type: `https://api.bonfire.com/errors/${slug}`,
    title: statusErr.title,
    status: errStatus,
    detail,
    code: statusErr.code,
    instance: error.config?.url || "unknown",
    req_id: reqId !== "unknown" ? reqId : getHeader("x-correlation-id"),
    trace_id: getHeader("x-b3-traceid"),
    timestamp: new Date().toISOString(),
  };
};
