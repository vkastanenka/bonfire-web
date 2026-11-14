import { HttpClient } from "@/http";

export abstract class BaseService {
  protected readonly httpClient: HttpClient;

  constructor(httpClient: HttpClient) {
    this.httpClient = httpClient;
  }

  /**
   * TODO: AIP error mapping
   */

  // protected async execute<T>(
  //   requestFn: () => Promise<T>,
  //   urlPath?: string,
  // ): Promise<T> {
  //   try {
  //     return await requestFn();
  //   } catch (error) {
  //     if (error instanceof AipError || error instanceof AppError) {
  //       throw error;
  //     }

  //     if (error instanceof HttpError) {
  //       const fullUrl = urlPath
  //         ? `${this.httpClient.config.baseUrl}${urlPath}`
  //         : this.httpClient.config.baseUrl;
  //       throw toAipError(error, fullUrl);
  //     }

  //     throw error;
  //   }
  // }
}
