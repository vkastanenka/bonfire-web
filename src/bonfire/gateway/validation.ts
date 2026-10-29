import { z } from "@/validation";

export const printTicketResponseSchema = z.object({
  ticket: z.uuid(),
});

export type PrintTicketResponse = z.infer<typeof printTicketResponseSchema>;
