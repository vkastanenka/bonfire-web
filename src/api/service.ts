import * as http from "@/http";

export abstract class BaseService {
  protected readonly client: http.Client;
  protected abstract readonly routePrefix: string;

  constructor(client: http.Client) {
    this.client = client;
  }

  protected url(path: string = ""): string {
    const formattedPath = path
      ? path.startsWith("/")
        ? path
        : `/${path}`
      : "";
    return `${this.routePrefix}${formattedPath}`;
  }
}
