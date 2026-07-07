import { ZodError } from "zod";
import type { ProblemDetails } from "./types";

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

  constructor(url: string, zodError: ZodError, message: string) {
    super(message);
    this.name = "ResponseValidationError";
    this.url = url;
    this.zodError = zodError;
  }
}
