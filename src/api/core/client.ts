import axios, {
  type AxiosInstance,
  AxiosError,
  isCancel,
  type AxiosRequestConfig,
} from "axios";
import { z } from "zod";
import type { Config } from "./config";
import {
  BACKEND_ERROR_MAP,
  DEFAULT_INTERNAL_ERROR,
  ApiNetworkError,
  ResponseValidationError,
  isProblemDetails,
  type ProblemDetails,
} from "./errors";

export interface HttpClient {
  request<T extends z.ZodTypeAny>(
    config: ValidatedRequestConfig<T>,
  ): Promise<z.infer<T>>;
}

export interface ValidatedRequestConfig<
  T extends z.ZodTypeAny,
> extends AxiosRequestConfig {
  scope: string;
  schema: T;
  context?: string;
}

export class BonfireHttpClient implements HttpClient {
  private readonly name: string;
  private readonly instance: AxiosInstance;

  constructor(name: string, config: Config) {
    this.name = name;
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

        const serviceName = this.name;
        const status = error.response?.status || 500;
        const incomingData = error.response?.data;

        let normalizedDetails: ProblemDetails;

        if (isProblemDetails(incomingData)) {
          normalizedDetails = incomingData;
        } else {
          const meta = BACKEND_ERROR_MAP[status] || DEFAULT_INTERNAL_ERROR;
          const slug = meta.code.toLowerCase().replace(/_/g, "-");

          const reqId =
            (error.response?.headers?.["x-request-id"] as string) || "unknown";
          const traceId =
            (error.response?.headers?.["x-trace-id"] as string) || "unknown";

          normalizedDetails = {
            type: `https://api.bonfire.com/errors/${slug}`,
            title: meta.title,
            status,
            detail: error.message || meta.detail,
            code: meta.code,
            instance: error.config?.url || "unknown",
            req_id: reqId,
            trace_id: traceId,
            timestamp: new Date().toISOString(),
          };
        }

        console.error(
          `[${serviceName} Error ${status}]: ${normalizedDetails.detail} (ReqID: ${normalizedDetails.req_id})`,
        );

        return Promise.reject(
          new ApiNetworkError(serviceName, normalizedDetails),
        );
      },
    );
  }

  public async request<T extends z.ZodTypeAny>(
    config: ValidatedRequestConfig<T>,
  ): Promise<z.infer<T>> {
    const { schema, ...axiosConfig } = config;
    const serviceName = this.name;

    const response = await this.instance.request({
      ...axiosConfig,
    });

    const result = schema.safeParse(response.data);

    if (!result.success) {
      console.error(
        `[${serviceName}] Contract Violation at ${axiosConfig.url || ""}:`,
        result.error.format(),
      );
      throw new ResponseValidationError(
        serviceName,
        axiosConfig.url || "",
        result.error,
        "Response failed runtime contract verification against client schema.",
      );
    }

    return result.data;
  }
}

export class ScopedClient {
  private readonly client: HttpClient;
  private readonly basePath: string;
  private readonly serviceName: string;

  constructor(client: HttpClient, basePath: string, serviceName: string) {
    this.client = client;
    this.basePath = basePath;
    this.serviceName = serviceName;
  }

  public request<T extends z.ZodTypeAny>(
    config: Omit<ValidatedRequestConfig<T>, "context">,
  ): Promise<z.infer<T>> {
    return this.client.request({
      ...config,
      url: `${this.basePath}${config.url ?? ""}`,
      context: this.serviceName,
    });
  }
}
