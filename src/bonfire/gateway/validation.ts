import { z } from "zod";
import { Presence } from "./presence";

export const presenceSchema = z.enum(
  Object.values(Presence) as [Presence, ...Presence[]],
);

export const printTicketResponseSchema = z.object({
  ticket: z.uuid(),
});

export type PrintTicketResponse = z.infer<typeof printTicketResponseSchema>;
