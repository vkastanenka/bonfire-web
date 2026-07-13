import { authService } from "./services";

export type GatewayStatus =
  | "CONNECTING"
  | "CONNECTED"
  | "DISCONNECTED"
  | "RECONNECTING";
export type Presence = "online" | "idle" | "dnd" | "invisible";

export interface GatewayMessage<T = unknown> {
  t: string;
  d: T;
}

type MessageListener = (message: GatewayMessage) => void;
type StatusListener = (status: GatewayStatus) => void;

interface GatewayConfig {
  getTicket: () => Promise<string>;
  initialPresence?: Presence;
}

/**
 * Pure function to construct the secure real-time gateway link.
 */
export function buildGatewayUrl(ticketId: string, presence: Presence): string {
  const httpUrl =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";
  const wsBaseUrl = httpUrl.replace(/^http/, "ws");

  const searchParams = new URLSearchParams({
    ticket_id: ticketId,
    presence: presence,
  });

  return `${wsBaseUrl}/gateway/ws?${searchParams.toString()}`;
}

export class GatewayManager {
  private ws: WebSocket | null = null;
  private config: GatewayConfig;
  private status: GatewayStatus = "DISCONNECTED";
  private presence: Presence;

  private messageListeners = new Set<MessageListener>();
  private statusListeners = new Set<StatusListener>();

  private reconnectAttempts = 0;
  private readonly maxReconnectDelay = 30000;
  private readonly baseReconnectDelay = 1000;
  private reconnectTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private forcedClose = false;

  private heartbeatTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private readonly watchdogTimeout = 35000;

  constructor(config: GatewayConfig) {
    this.config = config;
    this.presence = config.initialPresence || "online";
  }

  public subscribeToMessages(listener: MessageListener): () => void {
    this.messageListeners.add(listener);
    return () => this.messageListeners.delete(listener);
  }

  public subscribeToStatus(listener: StatusListener): () => void {
    this.statusListeners.add(listener);
    listener(this.status);
    return () => this.statusListeners.delete(listener);
  }

  public getStatus(): GatewayStatus {
    return this.status;
  }

  public setPresence(presence: Presence): void {
    this.presence = presence;
  }

  public async connect(): Promise<void> {
    if (this.status === "CONNECTED" || this.status === "CONNECTING") return;

    this.forcedClose = false;
    this.updateStatus(
      this.reconnectAttempts > 0 ? "RECONNECTING" : "CONNECTING",
    );

    try {
      // Pull fresh token data instantly inside the lock window to respect the 20s TTL
      const ticketId = await this.config.getTicket();
      const wsUrl = buildGatewayUrl(ticketId, this.presence);

      this.ws = new WebSocket(wsUrl);
      this.setupEventListeners();
    } catch (error) {
      console.error("[Gateway] Handshake extraction or setup failure:", error);
      this.handleReconnect();
    }
  }

  public disconnect(): void {
    this.forcedClose = true;
    this.clearTimeouts();
    this.updateStatus("DISCONNECTED");

    if (this.ws) {
      this.ws.close(1000, "Normal Closure");
      this.ws = null;
    }
    this.reconnectAttempts = 0;
  }

  public send(type: string, data: unknown): void {
    if (!this.ws || this.status !== "CONNECTED") {
      console.warn(`[Gateway] Outbound frame dropped. Status: ${this.status}`);
      return;
    }
    this.ws.send(JSON.stringify({ t: type, d: data }));
  }

  private setupEventListeners(): void {
    if (!this.ws) return;

    this.ws.onopen = () => {
      console.log("[Gateway] Pipeline stream running.");
      this.updateStatus("CONNECTED");
      this.reconnectAttempts = 0;
      this.startWatchdog();
    };

    this.ws.onmessage = (event) => {
      this.feedWatchdog();
      try {
        const message: GatewayMessage = JSON.parse(event.data);
        if (message.t) {
          this.messageListeners.forEach((listener) => listener(message));
        }
      } catch (err) {
        console.error("[Gateway] Message broadcast exception:", err);
      }
    };

    this.ws.onclose = (event) => {
      console.log(`[Gateway] Pipeline closed (${event.code})`);
      this.cleanupSocket();
      if (!this.forcedClose) this.handleReconnect();
    };

    this.ws.onerror = () => {};
  }

  private handleReconnect(): void {
    if (this.forcedClose) return;
    this.updateStatus("RECONNECTING");
    this.cleanupSocket();

    const delay = Math.min(
      this.maxReconnectDelay,
      this.baseReconnectDelay * Math.pow(2, this.reconnectAttempts),
    );
    const jitteredDelay = delay + Math.random() * 1000;

    this.reconnectTimeoutId = setTimeout(() => {
      this.reconnectAttempts++;
      this.connect();
    }, jitteredDelay);
  }

  private startWatchdog(): void {
    this.clearWatchdog();
    this.heartbeatTimeoutId = setTimeout(() => {
      if (this.ws) this.ws.close(4000, "Heartbeat Timeout");
    }, this.watchdogTimeout);
  }

  private feedWatchdog(): void {
    this.startWatchdog();
  }
  private clearWatchdog(): void {
    if (this.heartbeatTimeoutId) clearTimeout(this.heartbeatTimeoutId);
    this.heartbeatTimeoutId = null;
  }
  private clearTimeouts(): void {
    this.clearWatchdog();
    if (this.reconnectTimeoutId) clearTimeout(this.reconnectTimeoutId);
    this.reconnectTimeoutId = null;
  }

  private cleanupSocket(): void {
    this.clearWatchdog();
    if (this.ws) {
      this.ws.onopen = null;
      this.ws.onmessage = null;
      this.ws.onerror = null;
      this.ws.onclose = null;
    }
  }

  private updateStatus(newStatus: GatewayStatus): void {
    this.status = newStatus;
    this.statusListeners.forEach((listener) => listener(newStatus));
  }
}

export const gatewayManager = new GatewayManager({
  getTicket: async () => {
    const response = await authService.wsTicket();
    return response.ticket;
  },
});
