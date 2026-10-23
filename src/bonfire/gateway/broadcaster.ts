import { logger as baseLogger, Logger } from "@/lib";

const CHANNEL_NAME = "bonfire_gateway_broadcast";

export const BroadcastType = {
  message: "MESSAGE",
  presence: "PRESENCE",
  status: "STATUS",
} as const;

export type BroadcastType = (typeof BroadcastType)[keyof typeof BroadcastType];

interface Message<T = unknown> {
  senderId: string;
  type: BroadcastType;
  payload: T;
}

export class Broadcaster {
  private readonly id: string = crypto.randomUUID();
  private channel: BroadcastChannel | null = null;
  private readonly logger: Logger;
  private readonly listeners = new Set<
    (event: MessageEvent<Message>) => void
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
    } else {
      this.logger.debug("BroadcastChannel not supported.");
    }
  }

  public subscribe(
    callback: (type: BroadcastType, payload: unknown) => void,
    source?: string,
  ): () => void {
    if (!this.channel) {
      this.logger.debug("No channel to subscribe to.", { source });
      return () => {};
    }

    const listener = (event: MessageEvent<Message>) => {
      if (event.data && event.data.type) {
        try {
          callback(event.data.type, event.data.payload);
          this.logger.debug("Received broadcasted message from channel.", {
            senderId: event.data.senderId,
            type: event.data.type,
            source,
          });
        } catch (error) {
          this.logger.error("Broadcast listener execution error.", {
            type: event.data.type,
            senderId: event.data.senderId,
            source,
            error,
          });
        }
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

  public post<T>(type: BroadcastType, payload: T, source?: string): void {
    if (!this.channel) {
      this.logger.debug("No channel to post a message to.", {
        type,
        source,
      });
      return;
    }

    this.channel.postMessage({ senderId: this.id, type, payload });
    this.logger.debug("Posted message to channel.", { type, source });
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
