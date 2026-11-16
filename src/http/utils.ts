import { clientErrors, HttpClientError } from "./errors";
import type { CustomFetch, QueryParams } from "./types";

export const joinUrl = (baseUrl: string, path: string): string => {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
};

export const parseUrl = (rawUrl: string): URL => {
  if (rawUrl.trim().length === 0) {
    throw new HttpClientError(
      clientErrors.invalidUrl.code,
      clientErrors.invalidUrl.message(rawUrl),
      { cause: { providedUrl: rawUrl } },
    );
  }

  try {
    return new URL(rawUrl);
  } catch (cause) {
    throw new HttpClientError(
      clientErrors.invalidUrl.code,
      clientErrors.invalidUrl.message(rawUrl),
      { cause },
    );
  }
};

export const appendQueryParams = (url: URL, queryParams?: QueryParams): URL => {
  if (!queryParams) return url;

  Object.entries(queryParams).forEach(([key, val]) => {
    if (Array.isArray(val)) {
      val.forEach((item) => {
        if (item !== undefined && item !== null) {
          url.searchParams.append(key, String(item));
        }
      });
    } else if (val !== undefined && val !== null) {
      url.searchParams.append(key, String(val));
    }
  });

  return url;
};

export const isNativeRequestBody = (data: unknown): boolean =>
  typeof data === "string" ||
  data instanceof FormData ||
  data instanceof URLSearchParams ||
  data instanceof Blob ||
  data instanceof ArrayBuffer ||
  ArrayBuffer.isView(data) ||
  data instanceof ReadableStream;

export const buildHeaders = (
  defaultHeaders?: HeadersInit,
  requestHeaders?: HeadersInit,
  data?: unknown,
): Headers => {
  const headers = new Headers(defaultHeaders);

  if (requestHeaders) {
    new Headers(requestHeaders).forEach((value, key) => {
      headers.set(key, value);
    });
  }

  if (data instanceof FormData) {
    headers.delete("Content-Type");
  } else if (
    data != null &&
    !isNativeRequestBody(data) &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }

  return headers;
};

export const resolveRequestBody = (data: unknown): BodyInit | undefined => {
  if (data === undefined || data === null) return undefined;
  return isNativeRequestBody(data) ? (data as BodyInit) : JSON.stringify(data);
};

export interface ParsedResponse {
  data?: unknown;
  rawData?: string;
  error?: Error;
}

export const parseResponse = async (
  response: Response,
): Promise<ParsedResponse> => {
  if (response.status === 204 || response.status === 205) {
    return {};
  }

  const rawData = await response.text();
  if (rawData.trim() === "") {
    return { rawData };
  }

  const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";
  const isJson =
    contentType === "" ||
    contentType.includes("application/json") ||
    contentType.includes("+json");

  if (!isJson) {
    return { rawData, data: rawData };
  }

  try {
    return {
      rawData,
      data: JSON.parse(rawData),
    };
  } catch (err) {
    return {
      rawData,
      error: err instanceof Error ? err : new Error(String(err)),
    };
  }
};

export const resolveFetch = (customFetch?: CustomFetch): CustomFetch => {
  const fetchImpl = customFetch ?? globalThis.fetch?.bind(globalThis);
  if (!fetchImpl) {
    throw new HttpClientError(
      clientErrors.missingFetch.code,
      clientErrors.missingFetch.message,
    );
  }
  return fetchImpl;
};

export const resolveTimeout = (
  timeout: number | undefined,
  fallback: number,
): number => {
  const resolved = timeout ?? fallback;
  if (!Number.isFinite(resolved) || resolved <= 0) {
    throw new HttpClientError(
      clientErrors.invalidTimeout.code,
      clientErrors.invalidTimeout.message,
      { cause: { timeout } },
    );
  }
  return resolved;
};
