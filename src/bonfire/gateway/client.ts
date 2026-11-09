import { Client, type ClientRequestOptions } from "../http";
import { bonfireClient } from "../client";
import {
  printTicketResponseSchema,
  type PrintTicketResponse,
} from "./validation";

export class GatewayClient {
  protected readonly client: Client;

  constructor(client: Client = bonfireClient) {
    this.client = client;
  }

  public printTicket = (
    options?: ClientRequestOptions<PrintTicketResponse>,
  ): Promise<PrintTicketResponse> => {
    return this.client.post<PrintTicketResponse>({
      ...options,
      urlPath: "/gateway/ticket",
      schema: printTicketResponseSchema,
    });
  };
}

export const gatewayClient = new GatewayClient();
