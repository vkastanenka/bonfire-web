import { ZodError } from "zod";

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
  public readonly serviceContext: string;
  public readonly details: ProblemDetails;

  constructor(serviceContext: string, details: ProblemDetails) {
    super(details.detail);
    this.name = "ApiNetworkError";
    this.status = details.status;
    this.code = details.code;
    this.serviceContext = serviceContext;
    this.details = details;
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
  public readonly serviceContext: string;
  public readonly url: string;
  public readonly zodError: ZodError;

  constructor(
    serviceContext: string,
    url: string,
    zodError: ZodError,
    message: string,
  ) {
    super(message);
    this.name = "ResponseValidationError";
    this.serviceContext = serviceContext;
    this.url = url;
    this.zodError = zodError;
  }
}
