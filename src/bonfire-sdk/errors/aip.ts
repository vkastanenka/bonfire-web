import {
  aipDetailTypes,
  type AipBadRequest,
  type AipDebugInfo,
  type AipDetailType,
  type AipErrorDetail,
  type AipErrorInfo,
  type AipErrorPayload,
  type AipFieldViolation,
  type AipRequestInfo,
  type AipResourceInfo,
  type AipRetryInfo,
} from "./details";
import { formatRetryDelay, parseRetryDelayMs } from "./utils";

export class AipError extends Error {
  public readonly code: number;
  public readonly status: string;
  public readonly details: readonly AipErrorDetail[];

  constructor(payload: AipErrorPayload, options?: ErrorOptions) {
    super(payload.message, options);
    this.name = "AipError";
    this.code = payload.code;
    this.status = payload.status;
    this.details = payload.details ?? [];
  }

  public toPayload(): AipErrorPayload {
    return {
      code: this.code,
      message: this.message,
      status: this.status,
      ...(this.details.length > 0 ? { details: [...this.details] } : {}),
    };
  }

  public getErrorInfo(): AipErrorInfo | undefined {
    return this.getDetail<AipErrorInfo>(aipDetailTypes.errorInfo);
  }

  public getErrorInfoReason(): string | undefined {
    return this.getErrorInfo()?.reason;
  }

  public getRetryInfo(): AipRetryInfo | undefined {
    return this.getDetail<AipRetryInfo>(aipDetailTypes.retryInfo);
  }

  public getDebugInfo(): AipDebugInfo | undefined {
    return this.getDetail<AipDebugInfo>(aipDetailTypes.debugInfo);
  }

  public getBadRequest(): AipBadRequest | undefined {
    return this.getDetail<AipBadRequest>(aipDetailTypes.badRequest);
  }

  public getRequestInfo(): AipRequestInfo | undefined {
    return this.getDetail<AipRequestInfo>(aipDetailTypes.requestInfo);
  }

  public getResourceInfo(): AipResourceInfo | undefined {
    return this.getDetail<AipResourceInfo>(aipDetailTypes.resourceInfo);
  }

  public getFieldViolations(): AipFieldViolation[] {
    return this.getBadRequest()?.fieldViolations ?? [];
  }

  public getFieldViolation(fieldName: string): AipFieldViolation | undefined {
    return this.getFieldViolations().find((v) => v.field === fieldName);
  }

  public hasFieldViolations(): boolean {
    return this.getFieldViolations().length > 0;
  }

  public getRetryDelayMs(): number | undefined {
    const retryInfo = this.getRetryInfo();
    if (!retryInfo?.retryDelay) return undefined;

    return parseRetryDelayMs(retryInfo.retryDelay);
  }

  public getFormattedRetryDelay(): string | undefined {
    const ms = this.getRetryDelayMs();
    if (ms === undefined) return undefined;

    return formatRetryDelay(ms);
  }

  private getDetail<T extends AipErrorDetail>(
    typeUrl: AipDetailType | (string & {}),
  ): T | undefined {
    return this.details.find((d) => d["@type"] === typeUrl) as T | undefined;
  }
}
