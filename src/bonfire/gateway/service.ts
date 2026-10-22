import { API_ERROR_CODES } from "@/http";
import { AppError, logger } from "@/lib";
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

// TODO: Handle max connections

export class GatewayService {
  private ws: WebSocket | null = null;
  private client: GatewayClient;
  private status: GatewayStatus = GatewayStatus.disconnected;

  private connectionVersion = 0;
  private printTicketPromise: Promise<PrintTicketResponse> | null = null;

  private statusListeners = new Set<StatusListener>();
  private messageListeners = new Set<MessageListener>();

  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private readonly maxReconnectDelay = 30000;
  private readonly baseReconnectDelay = 1000;
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private forcedClose = false;

  private watchdogTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private readonly watchdogTimeout = 35000;

  constructor(client: GatewayClient = gatewayClient) {
    this.client = client;
  }

  public getStatus(): GatewayStatus {
    return this.status;
  }

  private updateStatus(newStatus: GatewayStatus): void {
    this.status = newStatus;
    this.statusListeners.forEach((listener) => listener(newStatus));
  }

  public subscribeToStatus(listener: StatusListener): () => void {
    this.statusListeners.add(listener);
    listener(this.status);
    return () => this.statusListeners.delete(listener);
  }

  public subscribeToMessages(listener: MessageListener): () => void {
    this.messageListeners.add(listener);
    return () => this.messageListeners.delete(listener);
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
      this.setupWs(presence);
    } catch (error) {
      if (this.connectionVersion === currentVersion && !this.forcedClose) {
        logger.error("[Gateway] Connection failed, retrying.", {
          error,
          connectionVersion: this.connectionVersion,
          reconnectAttempts: this.reconnectAttempts,
        });
        this.handleReconnect(presence, error);
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
      logger.warn(`[Gateway] Outbound frame dropped.`, { status: this.status });
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

  private setupWs(presence: Presence): void {
    if (!this.ws) return;

    this.ws.onopen = () => {
      this.reconnectAttempts = 0;
      this.updateStatus(GatewayStatus.connected);
      this.startWatchdog();
      logger.info("[Gateway] Connection established successfully.");
    };

    this.ws.onmessage = (event) => {
      this.startWatchdog();
      try {
        const message: GatewayMessage = JSON.parse(event.data);

        if (message.t) {
          this.messageListeners.forEach((listener) => {
            try {
              listener(message);
            } catch (listenerErr) {
              logger.error(`[Gateway] Error in message listener.`, {
                type: message.t,
                data: message.d,
                error: listenerErr,
              });
            }
          });
        }
      } catch (err) {
        logger.error(
          "[Gateway] Failed to parse incoming WebSocket message envelope.",
          {
            raw: event.data,
            error: err,
          },
        );
      }
    };

    this.ws.onerror = (event) => {
      logger.error("[Gateway] WebSocket network error encountered.", { event });
    };

    this.ws.onclose = (event) => {
      logger.warn("[Gateway] WebSocket connection closed.", {
        code: event.code,
        reason: event.reason,
        wasClean: event.wasClean,
      });

      this.cleanupSocket();

      if (!this.forcedClose) {
        this.handleReconnect(presence);
      }
    };
  }

  private handleReconnect(presence: Presence, error?: unknown): void {
    if (this.forcedClose) return;

    const isRateLimit =
      !!error &&
      error instanceof AppError &&
      error.code === API_ERROR_CODES.RATE_LIMIT_EXCEEDED;

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      logger.warn(
        "[Gateway] Max reconnection attempts reached. Stopping auto-retry.",
      );
      this.updateStatus(GatewayStatus.disconnected);
      this.cleanupSocket();
      this.reconnectAttempts = 0;
      return;
    }

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

    this.reconnectTimeout = setTimeout(() => {
      this.reconnectAttempts++;
      this.connect(presence);
    }, jitteredDelay);
  }

  private startWatchdog(): void {
    this.stopWatchdog();
    this.watchdogTimeoutId = setTimeout(() => {
      if (this.ws) this.ws.close(4000, "Heartbeat Timeout");
    }, this.watchdogTimeout);
  }

  private stopWatchdog(): void {
    if (this.watchdogTimeoutId) clearTimeout(this.watchdogTimeoutId);
    this.watchdogTimeoutId = null;
  }

  private clearReconnectTimeout(): void {
    if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
    this.reconnectTimeout = null;
  }

  private clearTimeouts(): void {
    this.stopWatchdog();
    this.clearReconnectTimeout();
  }

  private cleanupSocket(): void {
    this.stopWatchdog();
    if (this.ws) {
      this.ws.onopen = null;
      this.ws.onmessage = null;
      this.ws.onerror = null;
      this.ws.onclose = null;

      if (
        this.ws.readyState === WebSocket.OPEN ||
        this.ws.readyState === WebSocket.CONNECTING
      ) {
        this.ws.close(1000, "Normal Closure");
      }
      this.ws = null;
    }
  }
}

export const gatewayService = new GatewayService();
