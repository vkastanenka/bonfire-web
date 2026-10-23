import { logger as baseLogger, Logger } from "@/lib";

const CHANNEL_NAME = "bonfire_gateway_broadcast";

export const BroadcastType = {
  event: "EVENT",
  status: "STATUS",
  presence: "PRESENCE",
} as const;

export type BroadcastType = (typeof BroadcastType)[keyof typeof BroadcastType];

export interface BroadcastMessage<T = unknown> {
  senderId: string;
  type: BroadcastType;
  payload: T;
}

export class Broadcaster {
  private id: string = crypto.randomUUID();
  private channel: BroadcastChannel | null = null;
  private logger: Logger;
  private readonly listeners = new Set<
    (event: MessageEvent<BroadcastMessage>) => void
  >();

  constructor(logger: Logger = baseLogger) {
    this.logger = logger.child({
      package: "Gateway",
      module: "Broadcaster",
      channel: CHANNEL_NAME,
      broadcasterId: this.id,
    });

    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      this.channel = new BroadcastChannel(CHANNEL_NAME);
      this.logger.info("Set broadcast channel.");
    }
  }

  public post<T>(type: BroadcastType, payload: T, source?: string): void {
    if (!this.channel) {
      this.logger.warn("No channel to post a message to.", {
        type,
        payload,
        source,
      });
      return;
    }

    this.channel.postMessage({ senderId: this.id, type, payload });
    this.logger.info("Posted message to channel.", { type, payload, source });
  }

  public subscribe(
    callback: (type: BroadcastType, payload: unknown) => void,
    source?: string,
  ): () => void {
    if (!this.channel) {
      this.logger.warn("No channel to subscribe to.", { source });
      return () => {};
    }

    const listener = (event: MessageEvent<BroadcastMessage>) => {
      if (event.data && event.data.type) {
        callback(event.data.type, event.data.payload);
        this.logger.info("Received broadcasted message from channel.", {
          senderId: event.data.senderId,
          type: event.data.type,
          payload: event.data.payload,
          source,
        });
      }
    };

    this.listeners.add(listener);
    this.channel.addEventListener("message", listener);

    this.logger.info("Subscribed to broadcast channel messages.", {
      source,
      listenerCount: this.listeners.size,
    });

    return () => {
      this.channel?.removeEventListener("message", listener);
      this.listeners.delete(listener);

      this.logger.info("Unsubscribed from broadcast channel messages.", {
        source,
        listenerCount: this.listeners.size,
      });
    };
  }

  public close(): void {
    if (this.channel) {
      this.channel.close();
      this.channel = null;
      this.listeners.clear();
      this.logger.info("Closed broadcaster.");
    }
  }
}

export const broadcaster = new Broadcaster();
