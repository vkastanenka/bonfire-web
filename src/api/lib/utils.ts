import { type QueryParams } from "./request";

export const buildFullUrl = (
  baseUrl: string,
  path: string,
  queryParams?: QueryParams,
): URL => {
  const cleanBaseURL = baseUrl.replace(/\/+$/, "");
  const cleanPath = path.replace(/^\//, "");
  const url = new URL(
    cleanPath ? `${cleanBaseURL}/${cleanPath}` : cleanBaseURL,
  );

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

/**
 * Detects whether data is a native browser/Node body type that manages
 * its own Content-Type (e.g., FormData sets multipart boundaries automatically).
 */
export const isNativeRequestBody = (data: unknown): boolean => {
  if (data === null || data === undefined) return false;

  return (
    data instanceof FormData ||
    data instanceof URLSearchParams ||
    data instanceof Blob ||
    data instanceof ArrayBuffer ||
    ArrayBuffer.isView(data) // Catches TypedArrays like Uint8Array
  );
};

/**
 * Merges default and request-specific headers, automatically inferring
 * or clearing Content-Type based on request payload type.
 */
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

  // Handle Content-Type inference when payload exists
  if (data !== undefined && data !== null) {
    if (isNativeRequestBody(data)) {
      // Allow fetch to auto-generate boundaries (e.g. multipart/form-data)
      headers.delete("Content-Type");
    } else if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
  }

  return headers;
};
