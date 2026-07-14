import { authService } from "../auth";
import { type Presence } from "../presence";

export type GatewayStatus =
  | "CONNECTING"
  | "CONNECTED"
  | "DISCONNECTED"
  | "RECONNECTING";

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

export function buildGatewayUrl(ticketId: string, presence: Presence): string {
  const httpUrl =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

  const url = new URL(httpUrl);
  // Convert http/https to ws/wss safely
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";

  // Normalize path appending
  url.pathname = `${url.pathname.replace(/\/$/, "")}/gateway/ws`;

  url.searchParams.set("ticket_id", ticketId);
  url.searchParams.set("presence", presence);

  return url.toString();
}

export class GatewayManager {
  private ws: WebSocket | null = null;
  private config: GatewayConfig;
  private status: GatewayStatus = "DISCONNECTED";
  private presence: Presence;

  private connectionVersion = 0;
  private activeTicketPromise: Promise<string> | null = null;

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

    this.connectionVersion++;
    const currentVersion = this.connectionVersion;

    try {
      if (!this.activeTicketPromise) {
        this.activeTicketPromise = this.config.getTicket().finally(() => {
          this.activeTicketPromise = null;
        });
      }

      const ticketId = await this.activeTicketPromise;

      if (
        this.forcedClose ||
        this.status === "DISCONNECTED" ||
        this.connectionVersion !== currentVersion
      ) {
        console.log(
          "[Gateway] Stale connection sequence superseded. Aborting stream initialization.",
        );
        return;
      }

      const wsUrl = buildGatewayUrl(ticketId, this.presence);

      this.ws = new WebSocket(wsUrl);
      this.setupEventListeners();
    } catch (error) {
      if (this.connectionVersion === currentVersion) {
        if (!this.forcedClose) {
          console.error("[Gateway] Connection sequence failed:", error);

          // Detect rate limits from network error structure (e.g. 429)
          const isRateLimit =
            error instanceof Error &&
            (error.message.includes("429") ||
              error.message.toLowerCase().includes("rate limit"));

          this.handleReconnect(isRateLimit);
        }
      }
    }
  }

  public disconnect(): void {
    this.forcedClose = true;
    this.connectionVersion++;

    this.clearTimeouts();
    this.updateStatus("DISCONNECTED");

    if (this.ws) {
      // Safe guard socket state closure
      if (
        this.ws.readyState === WebSocket.OPEN ||
        this.ws.readyState === WebSocket.CONNECTING
      ) {
        this.ws.close(1000, "Normal Closure");
      }
      this.cleanupSocket();
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
      console.log("[Gateway] Real-time stream established.");
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
        console.error("[Gateway] Message broadcast processing exception:", err);
      }
    };

    this.ws.onclose = (event) => {
      console.log(`[Gateway] Stream terminated by host (Code: ${event.code})`);
      this.cleanupSocket();
      if (!this.forcedClose) {
        this.handleReconnect();
      }
    };

    this.ws.onerror = (err) => {
      // Browsers intentionally hide error details from JS WS APIs for security reasons.
      // We rely on the subsequent onclose hook to run the recovery strategy.
      console.debug(
        "[Gateway] Transport channel encountered a pipeline exception:",
        err,
      );
    };
  }

  private handleReconnect(isRateLimit = false): void {
    if (this.forcedClose) return;
    this.updateStatus("RECONNECTING");
    this.cleanupSocket();

    const baseDelay = isRateLimit
      ? Math.max(5000, this.baseReconnectDelay)
      : this.baseReconnectDelay;

    const delay = Math.min(
      this.maxReconnectDelay,
      baseDelay * Math.pow(2, this.reconnectAttempts),
    );
    // Add simple jitter to spread cluster attempts on backend reconnection
    const jitteredDelay = delay + Math.random() * 1000;

    console.log(
      `[Gateway] Stream recovery scheduled in ${Math.round(jitteredDelay)}ms (Rate Limited: ${isRateLimit})`,
    );

    this.reconnectTimeoutId = setTimeout(() => {
      this.reconnectAttempts++;
      this.connect();
    }, jitteredDelay);
  }

  private startWatchdog(): void {
    this.clearWatchdog();
    this.heartbeatTimeoutId = setTimeout(() => {
      console.warn(
        "[Gateway] Keep-alive threshold exceeded. Severing pipeline.",
      );
      if (this.ws) {
        this.ws.close(4000, "Heartbeat Timeout");
      }
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
