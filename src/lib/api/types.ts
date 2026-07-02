import type { AxiosInstance, AxiosRequestConfig } from "axios";
import { z } from "zod";

export interface InvalidParam {
  name: string;
  reason: string;
}

export interface ApiErrorResponse {
  type: string;
  title: string;
  status: number;
  detail: string; // This is the main human-readable error message
  code: string;
  instance: string;
  invalid_params?: InvalidParam[]; // Matches your Go struct
  req_id: string;
  trace_id: string;
  timestamp: string;
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
