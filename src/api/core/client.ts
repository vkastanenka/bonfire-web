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
  type ProblemDetails,
} from "./errors";

export interface ApiClient {
  request<T extends z.ZodTypeAny>(
    config: ValidatedRequestConfig<T>,
  ): Promise<z.infer<T>>;
}

export interface ValidatedRequestConfig<
  T extends z.ZodTypeAny,
> extends AxiosRequestConfig {
  schema: T;
  context?: string;
}

interface InternalConfigWithMetadata {
  metadata?: { serviceName?: string };
}

export class BonfireHttpClient implements ApiClient {
  private readonly defaultName: string;
  private readonly instance: AxiosInstance;

  constructor(defaultName: string, config: Config) {
    this.defaultName = defaultName;
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
        if (isCancel(error)) {
          return Promise.reject(error);
        }

        // Safely extract the service name assigned by the BaseApiService request dispatcher
        const internalConfig = error.config as InternalConfigWithMetadata &
          typeof error.config;
        const serviceName =
          internalConfig?.metadata?.serviceName || this.defaultName;

        const status = error.response?.status || 500;
        const incomingData = error.response?.data;
        let normalizedDetails: ProblemDetails;

        if (
          incomingData &&
          typeof incomingData === "object" &&
          "code" in incomingData &&
          "detail" in incomingData
        ) {
          normalizedDetails = incomingData as ProblemDetails;
        } else {
          const reqId =
            (error.response?.headers?.["x-request-id"] as string) || "unknown";
          const traceId =
            (error.response?.headers?.["x-trace-id"] as string) || "unknown";

          normalizedDetails = {
            type: "https://api.bonfire.com/errors/infrastructure",
            title:
              status >= 500
                ? "Internal Infrastructure Error"
                : "Network Communication Failure",
            status,
            detail: error.message || "An unparseable network event occurred.",
            code: "INFRASTRUCTURE_ERROR",
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
    const { schema, context, ...axiosConfig } = config;
    const serviceName = context || this.defaultName;

    const runtimeConfig = {
      ...axiosConfig,
      metadata: { serviceName },
    };

    const response = await this.instance.request(runtimeConfig);
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
        `Response failed runtime type validation contract against client schema.`,
      );
    }

    return result.data;
  }
}
