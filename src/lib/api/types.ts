import type { AxiosInstance, AxiosRequestConfig } from "axios";
import { z } from "zod";

export interface ApiErrorResponse {
  reason?: string;
  message?: string;
}

export interface CustomAxiosInstance extends AxiosInstance {
  validatedGet<T extends z.ZodTypeAny>(
    url: string,
    schema: T,
    config?: AxiosRequestConfig,
  ): Promise<z.infer<T>>;
  validatedPost<T extends z.ZodTypeAny>(
    url: string,
    data: unknown,
    schema: T,
    config?: AxiosRequestConfig,
  ): Promise<z.infer<T>>;
}

export interface BaseApiConfig {
  name: string;
  baseUrl: string;
  endpoints: Record<string, string>;
}

export interface BaseApiServiceConfig<T extends BaseApiConfig> {
  endpoints: T["endpoints"];
}
