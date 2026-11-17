import { BaseService, type ServiceCallOptions } from "../shared";
import {
  printTicketResponseSchema,
  type PrintTicketResponse,
} from "./validation";

const endpoints = {
  ticket: "/gateway/ticket",
} as const;

export class GatewayService extends BaseService {
  public printTicket(
    options?: ServiceCallOptions,
  ): Promise<PrintTicketResponse> {
    return this.post({
      ...options,
      url: endpoints.ticket,
      schema: printTicketResponseSchema,
    });
  }
}
