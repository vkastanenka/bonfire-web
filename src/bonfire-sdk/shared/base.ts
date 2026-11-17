import type { ZodType } from "zod";
import {
  HttpClient,
  HttpError,
  type BeforeRequestFn,
  type HttpMethod,
  type HttpRequestOptions,
} from "@/http";
import { AipError, isAipErrorResponse } from "../errors";

const errors = {
  invalidResponse: "Response payload failed schema validation.",
} as const;

export type ServiceCallOptions = Omit<
  HttpRequestOptions,
  "method" | "url" | "data"
>;

export interface ServiceRequestOptions<T = unknown> extends Omit<
  HttpRequestOptions,
  "method"
> {
  method?: HttpMethod;
  schema?: ZodType<T>;
  protected?: boolean;
}

export abstract class BaseService {
  protected readonly httpClient: HttpClient;

  constructor(httpClient: HttpClient) {
    this.httpClient = httpClient;
  }

  protected get<T>(options: ServiceRequestOptions<T>): Promise<T> {
    return this.request<T>({ ...options, method: "GET" });
  }

  protected post<T>(options: ServiceRequestOptions<T>): Promise<T> {
    return this.request<T>({ ...options, method: "POST" });
  }

  protected put<T>(options: ServiceRequestOptions<T>): Promise<T> {
    return this.request<T>({ ...options, method: "PUT" });
  }

  protected patch<T>(options: ServiceRequestOptions<T>): Promise<T> {
    return this.request<T>({ ...options, method: "PATCH" });
  }

  protected delete<T>(options: ServiceRequestOptions<T>): Promise<T> {
    return this.request<T>({ ...options, method: "DELETE" });
  }

  protected async request<T>(options: ServiceRequestOptions<T>): Promise<T> {
    const {
      schema,
      method = "GET",
      protected: isProtected = true,
      beforeRequest,
      ...httpOptions
    } = options;

    const protectMetaHook: BeforeRequestFn = ({ context }) => {
      context.meta.protected = isProtected;
    };

    try {
      const raw = await this.httpClient.request({
        ...httpOptions,
        method,
        beforeRequest: [protectMetaHook, ...(beforeRequest ?? [])],
      });

      if (!schema) {
        return raw as T;
      }

      const parsed = schema.safeParse(raw);
      if (!parsed.success) {
        throw new Error(errors.invalidResponse, {
          cause: parsed.error,
        });
      }

      return parsed.data;
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  private normalizeError(error: unknown): unknown {
    if (error instanceof HttpError && isAipErrorResponse(error.data)) {
      return new AipError(error.data.error, { cause: error });
    }

    return error;
  }
}
