import type { z } from "zod";
import type { ClientConfig, RequestOptions } from "./types";
import { request } from "./request";

export class HttpClient {
  private readonly config: Required<ClientConfig>;

  constructor(config: ClientConfig) {
    this.config = {
      baseURL: config.baseURL,
      credentials: config.credentials ?? "include",
      headers: config.headers ?? {},
      maxAttempts: config.maxAttempts ?? 3,
      timeout: config.timeout ?? 10000,
      middleware: config.middleware ?? [],
    };
  }

  public async request<T extends z.ZodTypeAny = z.ZodTypeAny>(
    options: RequestOptions<T>,
  ): Promise<z.infer<T>> {
    return request(this.config, options);
  }

  public async get<T extends z.ZodTypeAny = z.ZodTypeAny>(
    url: string,
    options?: Omit<RequestOptions<T>, "method" | "url">,
  ): Promise<z.infer<T>> {
    return this.request({ ...options, method: "GET", url });
  }

  public async post<T extends z.ZodTypeAny = z.ZodTypeAny>(
    url: string,
    data?: unknown,
    options?: Omit<RequestOptions<T>, "method" | "url" | "data">,
  ): Promise<z.infer<T>> {
    return this.request({ ...options, method: "POST", url, data });
  }

  public async put<T extends z.ZodTypeAny = z.ZodTypeAny>(
    url: string,
    data?: unknown,
    options?: Omit<RequestOptions<T>, "method" | "url" | "data">,
  ): Promise<z.infer<T>> {
    return this.request({ ...options, method: "PUT", url, data });
  }

  public async patch<T extends z.ZodTypeAny = z.ZodTypeAny>(
    url: string,
    data?: unknown,
    options?: Omit<RequestOptions<T>, "method" | "url" | "data">,
  ): Promise<z.infer<T>> {
    return this.request({ ...options, method: "PATCH", url, data });
  }

  public async delete<T extends z.ZodTypeAny = z.ZodTypeAny>(
    url: string,
    options?: Omit<RequestOptions<T>, "method" | "url">,
  ): Promise<z.infer<T>> {
    return this.request({ ...options, method: "DELETE", url });
  }
}
