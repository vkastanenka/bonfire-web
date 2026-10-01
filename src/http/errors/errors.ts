import { AppError } from "@/lib";
import {
  AIP_DETAIL_TYPES,
  type AipErrorData,
  type AipErrorDetail,
  type AipErrorInfoDetail,
  type AipRetryInfoDetail,
  type AipDebugInfoDetail,
  type AipBadRequestDetail,
  type AipRequestInfoDetail,
  type AipResourceInfoDetail,
  type AipFieldViolation,
} from "./aip";

export class AipError extends AppError {
  public readonly httpCode: number;
  public readonly details: AipErrorDetail[];

  constructor(data: AipErrorData, cause?: unknown) {
    super({
      code: data.status,
      message: data.message,
      context: {
        httpCode: data.code,
        details: data.details ?? [],
      },
      cause,
    });

    this.httpCode = data.code;
    this.details = data.details ?? [];
  }

  public getDetail<T extends AipErrorDetail>(
    typeUrl: T["@type"],
  ): T | undefined {
    return this.details.find((d): d is T => d["@type"] === typeUrl);
  }

  public getErrorInfo(): AipErrorInfoDetail | undefined {
    return this.getDetail(AIP_DETAIL_TYPES.ERROR_INFO);
  }

  public getRetryInfo(): AipRetryInfoDetail | undefined {
    return this.getDetail(AIP_DETAIL_TYPES.RETRY_INFO);
  }

  public getDebugInfo(): AipDebugInfoDetail | undefined {
    return this.getDetail(AIP_DETAIL_TYPES.DEBUG_INFO);
  }

  public getBadRequest(): AipBadRequestDetail | undefined {
    return this.getDetail(AIP_DETAIL_TYPES.BAD_REQUEST);
  }

  public getRequestInfo(): AipRequestInfoDetail | undefined {
    return this.getDetail(AIP_DETAIL_TYPES.REQUEST_INFO);
  }

  public getResourceInfo(): AipResourceInfoDetail | undefined {
    return this.getDetail(AIP_DETAIL_TYPES.RESOURCE_INFO);
  }

  public getFieldViolations(): AipFieldViolation[] {
    return this.getBadRequest()?.fieldViolations ?? [];
  }

  public getFieldViolation(fieldName: string): AipFieldViolation | undefined {
    return this.getBadRequest()?.fieldViolations?.find(
      (v) => v.field === fieldName,
    );
  }

  public override toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      httpCode: this.httpCode,
      status: this.code,
      details: this.details,
    };
  }
}
