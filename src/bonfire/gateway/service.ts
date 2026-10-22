import { bonfireClient } from "../client";
import { gatewayClient, type GatewayClient } from "./client";
import { Presence } from "./presence";
import type { PrintTicketResponse } from "./validation";

export const GatewayStatus = {
  connecting: "CONNECTING",
  connected: "CONNECTED",
  disconnected: "DISCONNECTED",
  reconnecting: "RECONNECTING",
} as const;

export type GatewayStatus = (typeof GatewayStatus)[keyof typeof GatewayStatus];

export interface GatewayMessage<T = unknown> {
  t: string;
  d: T;
}

type StatusListener = (status: GatewayStatus) => void;
type MessageListener = (message: GatewayMessage) => void;

export class GatewayService {
  private ws: WebSocket | null = null;
  private client: GatewayClient;
  private status: GatewayStatus = GatewayStatus.disconnected;

  private connectionVersion = 0;
  private printTicketPromise: Promise<PrintTicketResponse> | null = null;

  private statusListeners = new Set<StatusListener>();
  private messageListeners = new Set<MessageListener>();

  private reconnectAttempts = 0;
  private readonly maxReconnectDelay = 30000;
  private readonly baseReconnectDelay = 1000;
  private reconnectTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private forcedClose = false;

  private watchdogTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private readonly watchdogTimeout = 35000;

  private heartbeatIntervalId: ReturnType<typeof setInterval> | null = null;
  private readonly heartbeatInterval = 20000;

  constructor(client: GatewayClient = gatewayClient) {
    this.client = client;
  }

  // DONE
  public subscribeToStatus(listener: StatusListener): () => void {
    this.statusListeners.add(listener);
    listener(this.status);
    return () => this.statusListeners.delete(listener);
  }

  public subscribeToMessages(listener: MessageListener): () => void {
    this.messageListeners.add(listener);
    return () => this.messageListeners.delete(listener);
  }

  // DONE
  public getStatus(): GatewayStatus {
    return this.status;
  }

  public async connect(presence: Presence): Promise<void> {
    if (
      this.status === GatewayStatus.connected ||
      this.status === GatewayStatus.connecting
    )
      return;

    this.forcedClose = false;

    this.updateStatus(
      this.reconnectAttempts > 0
        ? GatewayStatus.reconnecting
        : GatewayStatus.connecting,
    );

    this.connectionVersion++;
    const currentVersion = this.connectionVersion;

    try {
      if (!this.printTicketPromise) {
        this.printTicketPromise = this.client.printTicket().finally(() => {
          this.printTicketPromise = null;
        });
      }

      const res = await this.printTicketPromise;

      if (
        this.forcedClose ||
        this.status === GatewayStatus.disconnected ||
        this.connectionVersion !== currentVersion
      ) {
        return;
      }

      const wsUrl = this.buildGatewayUrl(res.ticket, presence);

      this.ws = new WebSocket(wsUrl);
      this.setupEventListeners();
    } catch (error) {
      if (this.connectionVersion === currentVersion && !this.forcedClose) {
        console.error("[Gateway] Connection sequence failed:", error);
        const isRateLimit =
          error instanceof Error &&
          (error.message.includes("429") ||
            error.message.toLowerCase().includes("rate limit"));
        this.handleReconnect(isRateLimit);
      }
    }
  }

  public disconnect(): void {
    this.forcedClose = true;
    this.connectionVersion++;
    this.clearTimeouts();
    this.updateStatus(GatewayStatus.disconnected);

    if (this.ws) {
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
    if (!this.ws || this.status !== GatewayStatus.connected) {
      console.warn(`[Gateway] Outbound frame dropped. Status: ${this.status}`);
      return;
    }
    this.ws.send(JSON.stringify({ t: type, d: data }));
  }

  private buildGatewayUrl(ticket: string, presence: Presence): string {
    const url = new URL(bonfireClient.config.baseUrl);
    url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
    url.pathname = `${url.pathname.replace(/\/$/, "")}/gateway/ws`;
    url.searchParams.set("ticket", ticket);
    url.searchParams.set("presence", presence);
    return url.toString();
  }

  private setupEventListeners(): void {
    if (!this.ws) return;

    this.ws.onopen = () => {
      this.updateStatus(GatewayStatus.connected);
      this.reconnectAttempts = 0;
      this.startWatchdog();
      this.startHeartbeatLoop();
    };

    this.ws.onmessage = (event) => {
      this.feedWatchdog();
      try {
        const message: GatewayMessage = JSON.parse(event.data);
        if (message.t === "PING") {
          this.send("PONG", null);
          return;
        }
        if (message.t) {
          this.messageListeners.forEach((listener) => listener(message));
        }
      } catch (err) {
        console.error("[Gateway] Message processing error:", err);
      }
    };

    this.ws.onclose = (event) => {
      this.cleanupSocket();
      if (!this.forcedClose) {
        this.handleReconnect();
      }
    };
  }

  private handleReconnect(isRateLimit = false): void {
    if (this.forcedClose) return;
    this.updateStatus(GatewayStatus.reconnecting);
    this.cleanupSocket();

    const baseDelay = isRateLimit
      ? Math.max(5000, this.baseReconnectDelay)
      : this.baseReconnectDelay;
    const delay = Math.min(
      this.maxReconnectDelay,
      baseDelay * Math.pow(2, this.reconnectAttempts),
    );
    const jitteredDelay = delay + Math.random() * 1000;

    this.reconnectTimeoutId = setTimeout(() => {
      this.reconnectAttempts++;
      this.connect();
    }, jitteredDelay);
  }

  private startHeartbeatLoop(): void {
    this.heartbeatIntervalId = setInterval(() => {
      if (this.status === GatewayStatus.connected) {
        this.send("HEARTBEAT", null);
      }
    }, this.heartbeatInterval);
  }

  private stopHeartbeatLoop(): void {
    if (this.heartbeatIntervalId) {
      clearInterval(this.heartbeatIntervalId);
      this.heartbeatIntervalId = null;
    }
  }

  private startWatchdog(): void {
    this.clearWatchdog();
    this.watchdogTimeoutId = setTimeout(() => {
      if (this.ws) this.ws.close(4000, "Heartbeat Timeout");
    }, this.watchdogTimeout);
  }

  private feedWatchdog(): void {
    this.startWatchdog();
  }

  private clearWatchdog(): void {
    if (this.watchdogTimeoutId) clearTimeout(this.watchdogTimeoutId);
    this.watchdogTimeoutId = null;
  }

  private clearTimeouts(): void {
    this.clearWatchdog();
    this.stopHeartbeatLoop();
    if (this.reconnectTimeoutId) clearTimeout(this.reconnectTimeoutId);
    this.reconnectTimeoutId = null;
  }

  private cleanupSocket(): void {
    this.clearWatchdog();
    this.stopHeartbeatLoop();
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

export const gatewayService = new GatewayService();
