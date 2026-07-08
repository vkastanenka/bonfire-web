import axios, {
  type AxiosInstance,
  AxiosError,
  isCancel,
  type AxiosRequestConfig,
} from "axios";
import { z } from "zod";
import type { Config } from "./config";
import {
  ApiNetworkError,
  ResponseValidationError,
  mapErrToProblem,
} from "./errors";

export interface IHttpClient {
  request<T extends z.ZodTypeAny>(
    config: IValidatedReqConfig<T>,
  ): Promise<z.infer<T>>;
}

export interface IValidatedReqConfig<
  T extends z.ZodTypeAny,
> extends AxiosRequestConfig {
  schema: T;
}

export class HttpClient implements IHttpClient {
  private readonly instance: AxiosInstance;

  constructor(config: Config) {
    this.instance = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout,
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    this.instance.interceptors.response.use(
      (response) => response,
      (error: AxiosError<unknown>) => {
        if (isCancel(error)) return Promise.reject(error);

        const problem = mapErrToProblem(error);

        console.error(
          `[Error ${problem.status}]: ${problem.detail} (ReqID: ${problem.req_id})`,
        );

        return Promise.reject(new ApiNetworkError(problem));
      },
    );
  }

  public async request<T extends z.ZodTypeAny>(
    config: IValidatedReqConfig<T>,
  ): Promise<z.infer<T>> {
    const { schema, ...axiosConfig } = config;

    const response = await this.instance.request({
      ...axiosConfig,
    });

    const result = schema.safeParse(response.data);

    if (!result.success) {
      console.error(
        `[Contract Violation at ${axiosConfig.url || ""}:`,
        result.error,
      );
      throw new ResponseValidationError(
        result.error,
        "Response failed runtime contract verification against client schema.",
        axiosConfig.url || "",
      );
    }

    return result.data;
  }
}
