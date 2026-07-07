import axios, { type AxiosRequestConfig, AxiosError, isCancel } from "axios";
import { z } from "zod";
import type { CustomAxiosInstance, ApiErrorResponse } from "./types";
import { ApiNetworkError, ApiResponseValidationError } from "./errors";

interface ClientOptions {
  serviceName: string;
  baseURL: string;
}

export const createApiClient = (
  options: ClientOptions,
  config?: AxiosRequestConfig,
): CustomAxiosInstance => {
  const instance = axios.create({
    baseURL: options.baseURL,
    timeout: 15000,
    headers: {
      "Content-Type": "application/json",
    },
    withCredentials: true,
    ...config,
  });

  instance.interceptors.response.use(
    (response) => response,
    (error: AxiosError<unknown>) => {
      if (isCancel(error)) return Promise.reject(error);

      const status = error.response?.status || 500;
      const incomingData = error.response?.data;

      let normalizedDetails: ApiErrorResponse;

      if (
        incomingData &&
        typeof incomingData === "object" &&
        "type" in incomingData &&
        "title" in incomingData
      ) {
        normalizedDetails = incomingData as ApiErrorResponse;
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
          status: status,
          detail: error.message || "An unparseable network event occurred.",
          code: "infrastructure_error",
          instance: error.config?.url || "unknown",
          req_id: reqId,
          trace_id: traceId,
          timestamp: new Date().toISOString(),
        };
      }

      console.error(
        `[${options.serviceName} Network Error ${status}]: ${normalizedDetails.detail} (ReqID: ${normalizedDetails.req_id})`,
      );

      return Promise.reject(
        new ApiNetworkError(
          status,
          normalizedDetails,
          normalizedDetails.detail,
        ),
      );
    },
  );

  const safeRequest = async <T extends z.ZodTypeAny>(
    requestConfig: AxiosRequestConfig & { schema: T },
  ): Promise<z.infer<T>> => {
    const { schema, ...axiosConfig } = requestConfig;
    const response = await instance.request(axiosConfig);
    const result = schema.safeParse(response.data);

    if (!result.success) {
      console.error(
        `[${options.serviceName}] Schema Validation Failed at ${axiosConfig.url || ""}:`,
        result.error.format(),
      );
      throw new ApiResponseValidationError(
        options.serviceName,
        axiosConfig.url || "",
        result.error,
        `Contract mismatch identified at service: ${options.serviceName}`,
      );
    }

    return result.data;
  };

  return Object.assign(instance, { safeRequest }) as CustomAxiosInstance;
};
