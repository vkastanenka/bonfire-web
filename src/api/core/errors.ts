import { ZodError } from "zod";
import type { ApiErrorResponse } from "./types";

export class ApiNetworkError extends Error {
  public readonly status: number;
  public readonly details: ApiErrorResponse;

  constructor(status: number, details: ApiErrorResponse, message: string) {
    super(message);
    this.name = "ApiNetworkError";
    this.status = status;
    this.details = details;
  }

  public isValidationFailure(): boolean {
    return (
      Array.isArray(this.details.invalid_params) &&
      this.details.invalid_params.length > 0
    );
  }

  public getParamError(fieldName: string): string | undefined {
    return this.details.invalid_params?.find((p) => p.name === fieldName)
      ?.reason;
  }
}

export class ApiResponseValidationError extends Error {
  public readonly serviceName: string;
  public readonly url: string;
  public readonly zodError: ZodError;

  constructor(
    serviceName: string,
    url: string,
    zodError: ZodError,
    message: string,
  ) {
    super(message);
    this.name = "ApiResponseValidationError";
    this.serviceName = serviceName;
    this.url = url;
    this.zodError = zodError;
  }
}
