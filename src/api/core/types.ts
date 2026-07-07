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
  detail: string;
  code: string;
  instance: string;
  invalid_params?: InvalidParam[];
  req_id: string;
  trace_id: string;
  timestamp: string;
}

export interface CustomAxiosInstance extends AxiosInstance {
  safeRequest<T extends z.ZodTypeAny>(
    config: AxiosRequestConfig & { schema: T },
  ): Promise<z.infer<T>>;
}

export interface ApiServiceConfig {
  name: string;
  basePath: string;
}
