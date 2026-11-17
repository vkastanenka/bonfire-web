import { BaseService, type ServiceCallOptions } from "../shared";
import type { Presence } from "./presence";
import {
  printTicketResponseSchema,
  type PrintTicketResponse,
} from "./validation";

const endpoints = {
  ticket: "/gateway/ticket",
} as const;

export const gatewayStatuses = {
  connecting: "CONNECTING",
  connected: "CONNECTED",
  disconnected: "DISCONNECTED",
  reconnecting: "RECONNECTING",
} as const;

export type GatewayStatus =
  (typeof gatewayStatuses)[keyof typeof gatewayStatuses];

export interface GatewayMessage<T = unknown> {
  t: string;
  d: T;
}

type StatusListener = (status: GatewayStatus) => void;
type MessageListener = (message: GatewayMessage) => void;
type MessageHandler<T = unknown> = (data: T) => void;

export class GatewayService extends BaseService {
  private ws: WebSocket | null = null;
  private status: GatewayStatus = gatewayStatuses.disconnected;
  private connectionVersion = 0;
  private printTicketPromise: Promise<PrintTicketResponse> | null = null;

  private readonly statusListeners = new Set<StatusListener>();
  private readonly messageListeners = new Set<MessageListener>();

  private readonly messageHandlers = new Map<
    string,
    Set<MessageHandler<unknown>>
  >();

  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 3;
  private readonly maxReconnectDelayMs = 30000;
  private readonly baseReconnectDelayMs = 1000;
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private forcedClose = false;

  private watchdogTimeout: ReturnType<typeof setTimeout> | null = null;
  private readonly watchdogTimeoutMs = 35000;

  public getStatus(): GatewayStatus {
    return this.status;
  }

  public subscribeStatus(listener: StatusListener): () => void {
    this.statusListeners.add(listener);
    return () => {
      this.statusListeners.delete(listener);
    };
  }

  public subscribeMessage(listener: MessageListener): () => void {
    this.messageListeners.add(listener);
    return () => {
      this.messageListeners.delete(listener);
    };
  }

  public registerMessageHandler<T = unknown>(
    type: string,
    handler: MessageHandler<T>,
  ): () => void {
    let handlers = this.messageHandlers.get(type);

    if (!handlers) {
      handlers = new Set<MessageHandler<unknown>>();
      this.messageHandlers.set(type, handlers);
    }

    const castHandler = handler as MessageHandler<unknown>;
    handlers.add(castHandler);

    return () => {
      const currentHandlers = this.messageHandlers.get(type);
      if (currentHandlers && currentHandlers.has(castHandler)) {
        currentHandlers.delete(castHandler);
        if (currentHandlers.size === 0) {
          this.messageHandlers.delete(type);
        }
      }
    };
  }

  public handleMessage(message: GatewayMessage): void {
    if (!message || typeof message.t !== "string") return;

    const handlers = this.messageHandlers.get(message.t);
    if (handlers) {
      handlers.forEach((handler) => handler(message.d));
    }
  }

  public async connect(presence: Presence): Promise<void> {
    if (
      this.status === gatewayStatuses.connected ||
      this.status === gatewayStatuses.connecting
    ) {
      return;
    }

    this.forcedClose = false;
    this.updateStatus(
      this.reconnectAttempts > 0
        ? gatewayStatuses.reconnecting
        : gatewayStatuses.connecting,
    );

    this.connectionVersion++;
    const currentVersion = this.connectionVersion;

    try {
      if (!this.printTicketPromise) {
        this.printTicketPromise = this.printTicket().finally(() => {
          this.printTicketPromise = null;
        });
      }

      const res = await this.printTicketPromise;

      if (this.forcedClose || this.status === gatewayStatuses.disconnected) {
        return;
      }

      if (this.connectionVersion !== currentVersion) {
        return;
      }

      const wsUrl = this.buildGatewayUrl(res.ticket, presence);
      this.ws = new WebSocket(wsUrl);
      this.setupWs(presence);
    } catch {
      if (this.connectionVersion === currentVersion && !this.forcedClose) {
        this.handleReconnect(presence);
      }
    }
  }

  public disconnect(): void {
    this.forcedClose = true;
    this.connectionVersion++;
    this.clearTimeouts();
    this.statusListeners.clear();
    this.messageListeners.clear();
    this.updateStatus(gatewayStatuses.disconnected);

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
    this.messageHandlers.clear();
  }

  public send(type: string, data: unknown): void {
    if (!this.ws || this.status !== gatewayStatuses.connected) {
      return;
    }
    this.ws.send(JSON.stringify({ t: type, d: data }));
  }

  private printTicket(
    options?: ServiceCallOptions,
  ): Promise<PrintTicketResponse> {
    return this.post({
      ...options,
      url: endpoints.ticket,
      schema: printTicketResponseSchema,
    });
  }

  private updateStatus(newStatus: GatewayStatus): void {
    if (this.status === newStatus) return;
    this.status = newStatus;
    this.statusListeners.forEach((listener) => listener(newStatus));
  }

  private buildGatewayUrl(ticket: string, presence: Presence): string {
    const baseUrl = this.httpClient.config.baseUrl;
    const url = new URL(baseUrl);
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
      this.updateStatus(gatewayStatuses.connected);
      this.startWatchdog();
    };

    this.ws.onmessage = (event) => {
      this.startWatchdog();
      try {
        const message: GatewayMessage = JSON.parse(event.data);
        if (message && typeof message.t === "string") {
          this.handleMessage(message);
          this.messageListeners.forEach((listener) => listener(message));
        }
      } catch {
        // Silently drop malformed incoming frames
      }
    };

    this.ws.onerror = () => {};

    this.ws.onclose = () => {
      this.cleanupSocket();
      if (!this.forcedClose) {
        this.handleReconnect(presence);
      }
    };
  }

  private handleReconnect(presence: Presence): void {
    if (this.forcedClose) return;

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.updateStatus(gatewayStatuses.disconnected);
      this.cleanupSocket();
      this.reconnectAttempts = 0;
      return;
    }

    this.updateStatus(gatewayStatuses.reconnecting);
    this.cleanupSocket();

    const delay = Math.min(
      this.maxReconnectDelayMs,
      this.baseReconnectDelayMs * Math.pow(2, this.reconnectAttempts),
    );
    const jitteredDelay = delay + Math.random() * 1000;

    this.reconnectTimeout = setTimeout(() => {
      this.reconnectAttempts++;
      this.connect(presence);
    }, jitteredDelay);
  }

  private startWatchdog(): void {
    this.stopWatchdog();
    this.watchdogTimeout = setTimeout(() => {
      if (this.ws) {
        this.ws.close(4000, "Heartbeat Timeout");
      }
    }, this.watchdogTimeoutMs);
  }

  private stopWatchdog(): void {
    if (this.watchdogTimeout) clearTimeout(this.watchdogTimeout);
    this.watchdogTimeout = null;
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
