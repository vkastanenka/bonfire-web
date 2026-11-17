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
