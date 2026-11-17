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

export interface AipErrorInfo {
  "@type": typeof aipDetailTypes.errorInfo;
  reason: string;
  domain: string;
  metadata?: Record<string, string>;
}

export interface AipRetryInfo {
  "@type": typeof aipDetailTypes.retryInfo;
  retryDelay?: string;
}

export interface AipDebugInfo {
  "@type": typeof aipDetailTypes.debugInfo;
  detail?: string;
  stackEntries?: string[];
}

export interface AipFieldViolation {
  field: string;
  description: string;
  reason?: string;
}

export interface AipBadRequest {
  "@type": typeof aipDetailTypes.badRequest;
  fieldViolations?: AipFieldViolation[];
}

export interface AipRequestInfo {
  "@type": typeof aipDetailTypes.requestInfo;
  requestId: string;
  servingData?: string;
}

export interface AipResourceInfo {
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
  | AipErrorInfo
  | AipRetryInfo
  | AipDebugInfo
  | AipBadRequest
  | AipRequestInfo
  | AipResourceInfo;

export type AipErrorDetail = AipKnownErrorDetail | AipGenericDetail;

export interface AipErrorPayload {
  code: number;
  message: string;
  status: string;
  details?: AipErrorDetail[];
}

export interface AipErrorResponse {
  error: AipErrorPayload;
}

export const isAipErrorPayload = (value: unknown): value is AipErrorPayload => {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  const hasBaseFields =
    typeof candidate.code === "number" &&
    typeof candidate.status === "string" &&
    typeof candidate.message === "string";

  if (!hasBaseFields) {
    return false;
  }

  if ("details" in candidate && candidate.details !== undefined) {
    return Array.isArray(candidate.details);
  }

  return true;
};

export const isAipErrorResponse = (data: unknown): data is AipErrorResponse => {
  if (typeof data !== "object" || data === null || !("error" in data)) {
    return false;
  }

  return isAipErrorPayload((data as { error: unknown }).error);
};

const durationUnitToMs: Record<string, number> = {
  h: 60 * 60 * 1000,
  m: 60 * 1000,
  s: 1000,
  ms: 1,
  us: 1 / 1000,
  µs: 1 / 1000,
  ns: 1 / 1_000_000,
};

const pluralize = (count: number, unit: string): string =>
  `${count} ${unit}${count === 1 ? "" : "s"}`;

export const parseRetryDelayMs = (delay: string): number | undefined => {
  if (!delay.trim()) return undefined;

  const regex = /([0-9.]+)(h|m(?!s)|ms|s|us|µs|ns)/g;
  let totalMs = 0;
  let found = false;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(delay)) !== null) {
    const value = Number.parseFloat(match[1]);
    const multiplier = durationUnitToMs[match[2]];

    if (!Number.isFinite(value) || multiplier === undefined) {
      continue;
    }

    found = true;
    totalMs += value * multiplier;
  }

  return found ? totalMs : undefined;
};

export const formatRetryDelay = (ms: number): string => {
  if (!Number.isFinite(ms) || ms <= 0) {
    return "1 second";
  }

  const totalSeconds = Math.ceil(ms / 1000);
  if (totalSeconds <= 0) {
    return "1 second";
  }

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes > 0) {
    const minStr = pluralize(minutes, "minute");
    return seconds > 0 ? `${minStr} ${pluralize(seconds, "second")}` : minStr;
  }

  return pluralize(totalSeconds, "second");
};
