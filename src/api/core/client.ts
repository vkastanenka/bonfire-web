import axios, {
  type AxiosInstance,
  AxiosError,
  isCancel,
  type AxiosRequestConfig,
} from "axios";
import { z } from "zod";
import type { HttpConfig } from "./config";
import {
  ApiNetworkError,
  ResponseValidationError,
  mapErrorToProblem,
} from "./errors";

export interface SdkRequestConfig<T extends z.ZodTypeAny> extends Pick<
  AxiosRequestConfig,
  "url"
> {
  schema: T;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  data?: unknown;
  queryParams?: Record<string, string | number | boolean | undefined>;
  signal?: AbortSignal;
  headers?: Record<string, string>;
}

export interface SdkRequestMeta {
  serviceName: string;
}

export type ScopedRequest = <T extends z.ZodTypeAny>(
  request: Omit<SdkRequestConfig<T>, "url"> & { url?: string },
) => Promise<z.infer<T>>;

export class HttpClient {
  private readonly instance: AxiosInstance;

  constructor(config: HttpConfig) {
    this.instance = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout,
      headers: { "Content-Type": "application/json" },
      withCredentials: true,
    });
    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    this.instance.interceptors.response.use(
      (response) => response,
      (error: AxiosError<unknown>) => {
        if (isCancel(error)) return Promise.reject(error);
        return Promise.reject(new ApiNetworkError(mapErrorToProblem(error)));
      },
    );
  }

  public async request<T extends z.ZodTypeAny>(
    config: SdkRequestConfig<T>,
    meta?: SdkRequestMeta,
  ): Promise<z.infer<T>> {
    const serviceName = meta?.serviceName || "HttpClient";
    try {
      const response = await this.instance.request({
        url: config.url,
        method: config.method,
        data: config.data,
        params: config.queryParams,
        headers: config.headers,
        signal: config.signal,
      });
      const result = config.schema.safeParse(response.data);
      if (!result.success) {
        console.error(
          `[${serviceName} Contract Violation] at ${config.url}:`,
          result.error,
        );
        throw new ResponseValidationError(
          result.error,
          "Response failed contract verification.",
          config.url || "",
        );
      }
      return result.data;
    } catch (error) {
      if (error instanceof ApiNetworkError) {
        console.error(
          `[${serviceName} Error ${error.status}]: ${error.message}`,
        );
      }
      throw error;
    }
  }

  public createScope(basePath: string, serviceName: string): ScopedRequest {
    return <T extends z.ZodTypeAny>(
      request: Omit<SdkRequestConfig<T>, "url"> & { url?: string },
    ) => {
      const cleanUrl = `${basePath}${request.url ?? ""}`.replace(/\/+/g, "/");
      return this.request({ ...request, url: cleanUrl }, { serviceName });
    };
  }
}
