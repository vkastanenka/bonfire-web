import { AppError } from "@/errs/app";
import { logger as baseLogger, Logger } from "@/logger";
import { API_ERROR_CODES } from "@/http";
import { bonfireClient } from "../client";
import { client as baseClient, type Client as BaseClient } from "./client";
import { Presence } from "./presence";
import type { PrintTicketResponse } from "./validation";
import {
  dispatcher as baseDispatcher,
  type Dispatcher as Dispatcher,
} from "./dispatcher";

export const Status = {
  connecting: "CONNECTING",
  connected: "CONNECTED",
  disconnected: "DISCONNECTED",
  reconnecting: "RECONNECTING",
} as const;

export type Status = (typeof Status)[keyof typeof Status];

export interface Message<T = unknown> {
  t: string;
  d: T;
}

type StatusListener = (status: Status) => void;
type MessageListener = (message: Message) => void;

export class Service {
  private ws: WebSocket | null = null;
  private readonly client: BaseClient;
  private readonly dispatcher: Dispatcher;
  private readonly logger: Logger;
  private status: Status = Status.disconnected;

  private connectionVersion = 0;
  private printTicketPromise: Promise<PrintTicketResponse> | null = null;

  private readonly statusListeners = new Set<StatusListener>();
  private readonly messageListeners = new Set<MessageListener>();

  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 5;
  private readonly maxReconnectDelayMs = 30000;
  private readonly baseReconnectDelayMs = 1000;
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private forcedClose = false;

  private watchdogTimeout: ReturnType<typeof setTimeout> | null = null;
  private readonly watchdogTimeoutMs = 35000;

  constructor(
    client: BaseClient = baseClient as BaseClient,
    dispatcher: Dispatcher = baseDispatcher,
    logger: Logger = baseLogger,
  ) {
    this.client = client;
    this.dispatcher = dispatcher;
    this.logger = logger.child({
      package: "Gateway",
      module: "Service",
    });
  }

  public getStatus(): Status {
    return this.status;
  }

  private updateStatus(newStatus: Status): void {
    const prevStatus = this.status;
    if (prevStatus === newStatus) return;

    this.status = newStatus;
    this.statusListeners.forEach((listener) => listener(newStatus));

    this.logger.info("Gateway status updated.", {
      prevStatus,
      newStatus,
      listenerCount: this.statusListeners.size,
    });
  }

  public subscribeStatus(
    listener: StatusListener,
    source?: string,
  ): () => void {
    const wrappedListener: StatusListener = (status) => {
      try {
        listener(status);
        this.logger.debug("Dispatched status to listener.", {
          status,
          source,
        });
      } catch (error) {
        this.logger.error("Status listener execution error.", {
          status,
          source,
          error,
        });
      }
    };

    this.statusListeners.add(wrappedListener);

    this.logger.info("Subscribed to status updates.", {
      listenerCount: this.statusListeners.size,
      source,
    });

    return () => {
      this.statusListeners.delete(wrappedListener);
      this.logger.info("Unsubscribed from status updates.", {
        listenerCount: this.statusListeners.size,
        source,
      });
    };
  }

  public subscribeMessage(
    listener: MessageListener,
    source?: string,
  ): () => void {
    const wrappedListener: MessageListener = (message) => {
      try {
        listener(message);
        this.logger.debug("Dispatched message to listener.", {
          type: message.t,
          source,
        });
      } catch (error) {
        this.logger.error("Message listener execution error.", {
          type: message.t,
          source,
          error,
        });
      }
    };

    this.messageListeners.add(wrappedListener);

    this.logger.info("Subscribed to messages.", {
      listenerCount: this.messageListeners.size,
      source,
    });

    return () => {
      this.messageListeners.delete(wrappedListener);
      this.logger.info("Unsubscribed from messages.", {
        listenerCount: this.messageListeners.size,
        source,
      });
    };
  }

  public async connect(presence: Presence): Promise<void> {
    if (this.status === Status.connected || this.status === Status.connecting) {
      this.logger.debug(
        "Gateway connected or connecting, start connect aborted.",
      );
      return;
    }

    this.forcedClose = false;

    this.updateStatus(
      this.reconnectAttempts > 0 ? Status.reconnecting : Status.connecting,
    );

    this.connectionVersion++;
    const currentVersion = this.connectionVersion;

    try {
      if (!this.printTicketPromise) {
        this.printTicketPromise = this.client.printTicket().finally(() => {
          this.printTicketPromise = null;
        });
      } else {
        this.logger.debug(
          "Ticket request already in flight, reusing existing promise.",
        );
      }

      const res = await this.printTicketPromise;

      if (this.forcedClose) {
        this.logger.debug(
          "Connection aborted post-ticket: gateway was forcibly closed.",
        );
        return;
      }

      if (this.status === Status.disconnected) {
        this.logger.debug(
          "Connection aborted post-ticket: gateway status is disconnected.",
        );
        return;
      }

      if (this.connectionVersion !== currentVersion) {
        this.logger.debug(
          "Connection aborted post-ticket: stale connection version.",
          {
            expectedVersion: currentVersion,
            actualVersion: this.connectionVersion,
          },
        );
        return;
      }

      const wsUrl = this.buildGatewayUrl(res.ticket, presence);

      this.ws = new WebSocket(wsUrl);
      this.setupWs(presence);
    } catch (error) {
      if (this.connectionVersion === currentVersion && !this.forcedClose) {
        this.logger.error("WebSocket connection failed, retrying.", {
          connectionVersion: this.connectionVersion,
          reconnectAttempts: this.reconnectAttempts,
          error,
        });
        this.handleReconnect(presence, error);
      }
    }
  }

  public disconnect(): void {
    this.forcedClose = true;
    this.connectionVersion++;
    this.clearTimeouts();
    this.statusListeners.clear();
    this.messageListeners.clear();
    this.updateStatus(Status.disconnected);

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
    this.logger.info("Disconnected WebSocket gateway.");
  }

  public send(type: string, data: unknown): void {
    if (!this.ws || this.status !== Status.connected) {
      this.logger.warn("Outbound WebSocket message dropped.", {
        status: this.status,
      });
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
      this.updateStatus(Status.connected);
      this.startWatchdog();
      this.logger.info("WebSocket connection established successfully.");
    };

    this.ws.onmessage = (event) => {
      this.startWatchdog();
      try {
        const message: Message = JSON.parse(event.data);

        if (message.t) {
          this.dispatcher.dispatch(message.t, message.d);
          this.messageListeners.forEach((listener) => listener(message));
        }
      } catch (err) {
        this.logger.error(
          "Failed to parse incoming WebSocket message envelope.",
          {
            raw: event.data,
            error: err,
          },
        );
      }
    };

    this.ws.onerror = (event) => {
      this.logger.error("WebSocket network error encountered.", { event });
    };

    this.ws.onclose = (event) => {
      this.logger.warn("WebSocket connection closed.", {
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
      this.logger.warn(
        "Max reconnection attempts reached. Stopping auto-retry.",
      );
      this.updateStatus(Status.disconnected);
      this.cleanupSocket();
      this.reconnectAttempts = 0;
      return;
    }

    this.updateStatus(Status.reconnecting);
    this.cleanupSocket();

    const baseDelay = isRateLimit
      ? Math.max(5000, this.baseReconnectDelayMs)
      : this.baseReconnectDelayMs;

    const delay = Math.min(
      this.maxReconnectDelayMs,
      baseDelay * Math.pow(2, this.reconnectAttempts),
    );
    const jitteredDelay = delay + Math.random() * 1000;

    this.reconnectTimeout = setTimeout(() => {
      this.reconnectAttempts++;
      this.connect(presence);
    }, jitteredDelay);

    this.logger.info("Scheduled WebSocket reconnection attempt.", {
      attempt: this.reconnectAttempts + 1,
      delayMs: Math.round(jitteredDelay),
    });
  }

  private startWatchdog(): void {
    this.stopWatchdog();
    this.watchdogTimeout = setTimeout(() => {
      if (this.ws) {
        this.logger.warn("Watchdog timeout reached, closing socket.");
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

export const service = new Service();
