import { z } from "zod";
import { httpConfig } from "./config";
import {
  AuthMiddleware,
  RetryMiddleware,
  type HttpMiddleware,
} from "./middleware";
import {
  httpRequest,
  type HttpRequestMeta,
  type HttpRequestOptions,
} from "./request";
import { sessionManager } from "../session";

export type ScopedRequest<T extends z.ZodTypeAny = z.ZodTypeAny> = Omit<
  HttpRequestOptions<T>,
  "path"
> & {
  path?: string;
};

export type ScopedClient = <T extends z.ZodTypeAny>(
  request: ScopedRequest<T>,
) => Promise<z.infer<T>>;

export class HttpClient {
  private readonly baseURL: string;
  private readonly middleware: HttpMiddleware[];

  constructor(options: { baseURL: string; middleware?: HttpMiddleware[] }) {
    this.baseURL = options.baseURL.replace(/\/$/, "");
    this.middleware = options.middleware || [];
  }

  public async request<T extends z.ZodTypeAny>(
    options: HttpRequestOptions<T>,
    meta?: HttpRequestMeta,
  ): Promise<z.infer<T>> {
    return httpRequest(
      { baseURL: this.baseURL, middleware: this.middleware },
      options,
      meta,
    );
  }

  public scope(baseUrl: string, serviceName = "HttpClient"): ScopedClient {
    return <T extends z.ZodTypeAny>(
      subOptions: ScopedRequest<T>,
    ): Promise<z.infer<T>> => {
      const combinedUrl = `${baseUrl}/${subOptions.path ?? ""}`.replace(
        /\/+/g,
        "/",
      );

      return this.request({ ...subOptions, url: combinedUrl }, { serviceName });
    };
  }
}

export const httpClient = new HttpClient({
  baseURL: httpConfig.baseURL,
  middleware: [new AuthMiddleware(sessionManager), new RetryMiddleware(3)],
});
