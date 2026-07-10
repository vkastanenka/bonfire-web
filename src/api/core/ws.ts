// Match the structural envelope of your backend gateway's WSMessage
export interface WSMessageOutbound<T = unknown> {
  t: string;
  d: T;
}

export interface WSMessageInbound {
  t: string;
  d: unknown;
}

// Map parameters needed for connection strings
export interface WSConnectionParams {
  ticketId: string;
  presence?: "online" | "idle" | "do_not_disturb" | "invisible";
}

export function buildWSUrl(params: WSConnectionParams): string {
  // Convert http/https baseURL to ws/wss automatically
  const httpUrl =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";
  const wsBaseUrl = httpUrl.replace(/^http/, "ws");

  const searchParams = new URLSearchParams({
    ticket_id: params.ticketId,
    presence: params.presence || "online",
  });

  return `${wsBaseUrl}/ws?${searchParams.toString()}`;
}
