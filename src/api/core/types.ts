import type { AxiosRequestConfig } from "axios";
import { z } from "zod";

export interface InvalidParam {
  name: string;
  reason: string;
}

export interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
  code: string;
  invalid_params?: InvalidParam[];
  req_id: string;
  trace_id: string;
  timestamp: string;
}

export interface ValidatedRequestConfig<
  T extends z.ZodTypeAny,
> extends AxiosRequestConfig {
  schema: T;
}

export interface ApiClient {
  request<T extends z.ZodTypeAny>(
    config: ValidatedRequestConfig<T>,
  ): Promise<z.infer<T>>;
}
