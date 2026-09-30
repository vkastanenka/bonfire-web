import type { QueryParams } from "./types";

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

export const buildHeaders = (
  defaultHeaders?: Record<string, string>,
  requestHeaders?: Record<string, string>,
  data?: unknown,
): Headers => {
  const headers = new Headers(defaultHeaders);

  if (requestHeaders) {
    new Headers(requestHeaders).forEach((value, key) => {
      headers.set(key, value);
    });
  }

  if (
    data !== undefined &&
    data !== null &&
    !headers.has("Content-Type") &&
    !(data instanceof FormData) &&
    !(data instanceof URLSearchParams) &&
    !(data instanceof Blob)
  ) {
    headers.set("Content-Type", "application/json");
  }

  return headers;
};
