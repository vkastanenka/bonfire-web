import { type QueryParams } from "./request";

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

  if (data !== undefined && data !== null) {
    if (isNativeRequestBody(data)) {
      if (typeof FormData !== "undefined" && data instanceof FormData) {
        headers.delete("Content-Type");
      }
    } else if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
  }

  return headers;
};

export const isNativeRequestBody = (data: unknown): boolean => {
  if (data === null || data === undefined) return false;

  if (
    (typeof FormData !== "undefined" && data instanceof FormData) ||
    (typeof URLSearchParams !== "undefined" &&
      data instanceof URLSearchParams) ||
    (typeof Blob !== "undefined" && data instanceof Blob) ||
    (typeof ArrayBuffer !== "undefined" &&
      (data instanceof ArrayBuffer || ArrayBuffer.isView(data))) ||
    (typeof ReadableStream !== "undefined" && data instanceof ReadableStream)
  ) {
    return true;
  }

  const tag = Object.prototype.toString.call(data);
  return (
    tag === "[object FormData]" ||
    tag === "[object URLSearchParams]" ||
    tag === "[object Blob]" ||
    tag === "[object File]" ||
    tag === "[object ArrayBuffer]" ||
    tag === "[object ReadableStream]"
  );
};

export const resolveRequestBody = (data: unknown): BodyInit | undefined => {
  if (data === undefined || data === null) {
    return undefined;
  }

  if (isNativeRequestBody(data)) {
    return data as BodyInit;
  }

  return JSON.stringify(data);
};

export const parseJSON = async (
  response: Response,
): Promise<{ data: unknown; error?: Error }> => {
  if (response.status === 204 || response.status === 205) {
    return { data: undefined };
  }

  const rawText = await response.text();
  if (!rawText || rawText.trim() === "") {
    return { data: undefined };
  }

  try {
    return { data: JSON.parse(rawText) };
  } catch (err) {
    return {
      data: undefined,
      error: err instanceof Error ? err : new Error(String(err)),
    };
  }
};
