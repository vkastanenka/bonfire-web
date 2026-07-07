import axios, { type AxiosInstance, AxiosError, isCancel } from "axios";
import { z } from "zod";
import type { AppConfig } from "./config";
import { ApiNetworkError, ResponseValidationError } from "./errors";
import type {
  ApiClient,
  ProblemDetails,
  ValidatedRequestConfig,
} from "./types";

export class BonfireHttpClient implements ApiClient {
  private readonly serviceName: string;
  private readonly instance: AxiosInstance;

  constructor(serviceName: string, config: AppConfig) {
    this.serviceName = serviceName;
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
          `[${this.serviceName} Error ${status}]: ${normalizedDetails.detail} (ReqID: ${normalizedDetails.req_id})`,
        );

        return Promise.reject(new ApiNetworkError(normalizedDetails));
      },
    );
  }

  public async request<T extends z.ZodTypeAny>(
    config: ValidatedRequestConfig<T>,
  ): Promise<z.infer<T>> {
    const { schema, ...axiosConfig } = config;
    const response = await this.instance.request(axiosConfig);
    const result = schema.safeParse(response.data);

    if (!result.success) {
      console.error(
        `[${this.serviceName}] Contract Violation at ${axiosConfig.url || ""}:`,
        result.error.format(),
      );
      throw new ResponseValidationError(
        axiosConfig.url || "",
        result.error,
        `Response failed runtime type validation contract against client schema.`,
      );
    }

    return result.data;
  }
}
