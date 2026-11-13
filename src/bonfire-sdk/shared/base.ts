import { HttpClient } from "@/http";

export abstract class BaseService {
  protected readonly httpClient: HttpClient;

  constructor(httpClient: HttpClient) {
    this.httpClient = httpClient;
  }
}
