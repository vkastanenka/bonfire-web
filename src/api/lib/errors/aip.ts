import { STATUS_MESSAGES, STATUS_NAMES, type StatusCode } from "./status";

export const AIP_DETAIL_TYPES = {
  ERROR_INFO: "type.googleapis.com/google.rpc.ErrorInfo",
  RETRY_INFO: "type.googleapis.com/google.rpc.RetryInfo",
  DEBUG_INFO: "type.googleapis.com/google.rpc.DebugInfo",
  BAD_REQUEST: "type.googleapis.com/google.rpc.BadRequest",
  REQUEST_INFO: "type.googleapis.com/google.rpc.RequestInfo",
  RESOURCE_INFO: "type.googleapis.com/google.rpc.ResourceInfo",
} as const;

export type AipDetailType =
  (typeof AIP_DETAIL_TYPES)[keyof typeof AIP_DETAIL_TYPES];

export interface AipErrorInfoDetail {
  "@type": typeof AIP_DETAIL_TYPES.ERROR_INFO;
  reason: string;
  domain: string;
  metadata?: Record<string, string>;
}

export interface AipRetryInfoDetail {
  "@type": typeof AIP_DETAIL_TYPES.RETRY_INFO;
  retryDelay?: string;
}

export interface AipDebugInfoDetail {
  "@type": typeof AIP_DETAIL_TYPES.DEBUG_INFO;
  detail?: string;
  stackEntries?: string[];
}

export interface AipFieldViolation {
  field: string;
  description: string;
  reason?: string;
}

export interface AipBadRequestDetail {
  "@type": typeof AIP_DETAIL_TYPES.BAD_REQUEST;
  fieldViolations?: AipFieldViolation[];
}

export interface AipRequestInfoDetail {
  "@type": typeof AIP_DETAIL_TYPES.REQUEST_INFO;
  requestId: string;
  servingData?: string;
}

export interface AipResourceInfoDetail {
  "@type": typeof AIP_DETAIL_TYPES.RESOURCE_INFO;
  resourceType: string;
  resourceName: string;
  owner?: string;
  description?: string;
}

export type AipKnownErrorDetail =
  | AipErrorInfoDetail
  | AipRetryInfoDetail
  | AipDebugInfoDetail
  | AipBadRequestDetail
  | AipRequestInfoDetail
  | AipResourceInfoDetail;

export type AipErrorDetail = AipKnownErrorDetail;

export interface AipErrorData {
  code: number;
  message: string;
  status: string;
  details?: AipErrorDetail[];
}

export function isAipErrorData(data: unknown): data is AipErrorData {
  return (
    typeof data === "object" &&
    data !== null &&
    typeof (data as Record<string, unknown>).code === "number" &&
    typeof (data as Record<string, unknown>).status === "string" &&
    typeof (data as Record<string, unknown>).message === "string"
  );
}

export interface UnknownAipErrorOptions {
  domain?: string;
  timestamp?: string | Date | number;
}

export const UNKNOWN_AIP_ERROR_DATA = {
  STATUS: "UNKNOWN",
  DOMAIN: "http-client",
  MESSAGE: "The server responded with an unhandled HTTP status code.",
} as const;

export const createUnknownAipErrorData = (
  statusCode: number,
  url: string,
  data?: unknown,
  options?: UnknownAipErrorOptions,
): AipErrorData => {
  const code = statusCode as StatusCode;
  const statusName = STATUS_NAMES[code] ?? UNKNOWN_AIP_ERROR_DATA.STATUS;

  const message =
    extractBodyMessage(data) ??
    STATUS_MESSAGES[code] ??
    UNKNOWN_AIP_ERROR_DATA.MESSAGE;

  const formattedTimestamp = options?.timestamp
    ? new Date(options.timestamp).toISOString()
    : new Date().toISOString();

  const domain = options?.domain ?? UNKNOWN_AIP_ERROR_DATA.DOMAIN;

  const errorInfoDetail: AipErrorInfoDetail = {
    "@type": AIP_DETAIL_TYPES.ERROR_INFO,
    reason: statusName,
    domain,
    metadata: {
      instance: url,
      timestamp: formattedTimestamp,
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

  return createUnknownAipErrorData(response.status, url, data, options);
};

const extractBodyMessage = (data: unknown): string | null => {
  if (typeof data !== "object" || data === null) return null;
  if (
    "message" in data &&
    typeof data.message === "string" &&
    data.message.trim() !== ""
  ) {
    return data.message;
  }
  if (
    "error" in data &&
    typeof data.error === "string" &&
    data.error.trim() !== ""
  ) {
    return data.error;
  }
  return null;
};
