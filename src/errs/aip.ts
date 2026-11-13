import { AppError } from "./app";
import { statusMessages, statusNames, type StatusCode } from "./status";

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
    return this.getDetail(aipDetailTypes.errorInfo);
  }

  public getErrorInfoReason(): string | undefined {
    return this.getErrorInfo()?.reason;
  }

  public getRetryInfo(): AipRetryInfoDetail | undefined {
    return this.getDetail(aipDetailTypes.retryInfo);
  }

  public getDebugInfo(): AipDebugInfoDetail | undefined {
    return this.getDetail(aipDetailTypes.debugInfo);
  }

  public getBadRequest(): AipBadRequestDetail | undefined {
    return this.getDetail(aipDetailTypes.badRequest);
  }

  public getRequestInfo(): AipRequestInfoDetail | undefined {
    return this.getDetail(aipDetailTypes.requestInfo);
  }

  public getResourceInfo(): AipResourceInfoDetail | undefined {
    return this.getDetail(aipDetailTypes.resourceInfo);
  }

  public getFieldViolations(): AipFieldViolation[] {
    return this.getBadRequest()?.fieldViolations ?? [];
  }

  public getFieldViolation(fieldName: string): AipFieldViolation | undefined {
    return this.getBadRequest()?.fieldViolations?.find(
      (v) => v.field === fieldName,
    );
  }

  public hasFieldViolations(): boolean {
    const fieldViolations = this.getFieldViolations();
    return !!fieldViolations && fieldViolations.length > 0;
  }

  public getRetryDelayMs(): number | undefined {
    const retryInfo = this.getRetryInfo();
    if (!retryInfo?.retryDelay) return undefined;

    const str = retryInfo.retryDelay;
    let totalMs = 0;

    const regex = /([0-9.]+)(h|m(?!s)|ms|s|us|µs|ns)/g;
    let match;
    let found = false;

    while ((match = regex.exec(str)) !== null) {
      found = true;
      const value = parseFloat(match[1]);
      const unit = match[2];

      switch (unit) {
        case "h":
          totalMs += value * 60 * 60 * 1000;
          break;
        case "m":
          totalMs += value * 60 * 1000;
          break;
        case "s":
          totalMs += value * 1000;
          break;
        case "ms":
          totalMs += value;
          break;
        case "us":
        case "µs":
          totalMs += value / 1000;
          break;
        case "ns":
          totalMs += value / 1000000;
          break;
      }
    }

    return found ? totalMs : undefined;
  }

  public getFormattedRetryDelay(): string | undefined {
    const ms = this.getRetryDelayMs();
    if (ms === undefined) return undefined;

    const totalSeconds = Math.ceil(ms / 1000);
    if (totalSeconds <= 0) return "1 second";

    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    if (minutes > 0) {
      const minStr = `${minutes} minute${minutes === 1 ? "" : "s"}`;
      if (seconds > 0) {
        const secStr = `${seconds} second${seconds === 1 ? "" : "s"}`;
        return `${minStr} ${secStr}`;
      }
      return minStr;
    }

    return `${totalSeconds} second${totalSeconds === 1 ? "" : "s"}`;
  }

  public toAip(): AipErrorData {
    return {
      code: this.httpCode,
      message: this.message,
      status: this.code,
      details: this.details,
    };
  }

  public override toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      httpCode: this.httpCode,
      details: this.details,
    };
  }
}

export const aipDetailTypes = {
  errorInfo: "type.googleapis.com/google.rpc.ErrorInfo",
  retryInfo: "type.googleapis.com/google.rpc.RetryInfo",
  debugInfo: "type.googleapis.com/google.rpc.DebugInfo",
  badRequest: "type.googleapis.com/google.rpc.BadRequest",
  requestInfo: "type.googleapis.com/google.rpc.RequestInfo",
  resourceInfo: "type.googleapis.com/google.rpc.ResourceInfo",
} as const;

export type AipDetailType =
  (typeof aipDetailTypes)[keyof typeof aipDetailTypes];

export interface AipErrorInfoDetail {
  "@type": typeof aipDetailTypes.errorInfo;
  reason: string;
  domain: string;
  metadata?: Record<string, string>;
}

export interface AipRetryInfoDetail {
  "@type": typeof aipDetailTypes.retryInfo;
  retryDelay?: string;
}

export interface AipDebugInfoDetail {
  "@type": typeof aipDetailTypes.debugInfo;
  detail?: string;
  stackEntries?: string[];
}

export interface AipFieldViolation {
  field: string;
  description: string;
  reason?: string;
}

export interface AipBadRequestDetail {
  "@type": typeof aipDetailTypes.badRequest;
  fieldViolations?: AipFieldViolation[];
}

export interface AipRequestInfoDetail {
  "@type": typeof aipDetailTypes.requestInfo;
  requestId: string;
  servingData?: string;
}

export interface AipResourceInfoDetail {
  "@type": typeof aipDetailTypes.resourceInfo;
  resourceType: string;
  resourceName: string;
  owner?: string;
  description?: string;
}

export interface AipGenericDetail {
  "@type": string;
  [key: string]: unknown;
}

export type AipKnownErrorDetail =
  | AipErrorInfoDetail
  | AipRetryInfoDetail
  | AipDebugInfoDetail
  | AipBadRequestDetail
  | AipRequestInfoDetail
  | AipResourceInfoDetail;

export type AipErrorDetail = AipKnownErrorDetail | AipGenericDetail;

export interface AipErrorData {
  code: number;
  message: string;
  status: string;
  details?: AipErrorDetail[];
}

export function isAipErrorData(data: unknown): data is AipErrorData {
  if (typeof data !== "object" || data === null) return false;

  const candidate = data as Record<string, unknown>;

  const hasBaseFields =
    typeof candidate.code === "number" &&
    typeof candidate.status === "string" &&
    typeof candidate.message === "string";

  if (!hasBaseFields) return false;

  if ("details" in candidate && candidate.details !== undefined) {
    return Array.isArray(candidate.details);
  }

  return true;
}

export interface UnknownAipErrorOptions {
  domain?: string;
  cause?: unknown;
  timestamp?: string | Date | number;
}

export const unknownAipErrorData = {
  status: "UNKNOWN",
  domain: "http-client",
  message: "The server responded with an unhandled HTTP status code.",
} as const;

export const createUnknownAipErrorData = (
  statusCode: number,
  url: string,
  options?: UnknownAipErrorOptions,
): AipErrorData => {
  const code = statusCode as StatusCode;
  const statusName = statusNames[code] ?? unknownAipErrorData.status;
  const message = statusMessages[code] ?? unknownAipErrorData.message;

  let formattedTimestamp: string;
  try {
    formattedTimestamp = options?.timestamp
      ? new Date(options.timestamp).toISOString()
      : new Date().toISOString();
  } catch {
    formattedTimestamp = new Date().toISOString();
  }

  const domain = options?.domain ?? unknownAipErrorData.domain;

  const errorInfoDetail: AipErrorInfoDetail = {
    "@type": aipDetailTypes.errorInfo,
    reason: statusName,
    domain,
    metadata: {
      instance: url,
      timestamp: formattedTimestamp,
      ...(options?.cause instanceof Error
        ? { originalError: options.cause.name }
        : {}),
    },
  };

  return {
    code: statusCode,
    status: statusName,
    message,
    details: [errorInfoDetail],
  };
};

export const mapFetchToUnknownAipErrorData = (
  response: Response,
  data: unknown,
  url: string,
  options?: UnknownAipErrorOptions,
): AipErrorData => {
  if (isAipErrorData(data)) {
    return data;
  }

  if (typeof data === "object" && data !== null && "error" in data) {
    const wrappedError = (data as Record<string, unknown>).error;
    if (isAipErrorData(wrappedError)) {
      return wrappedError;
    }
  }

  return createUnknownAipErrorData(response.status, url, options);
};
