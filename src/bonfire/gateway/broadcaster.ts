import { logger } from "@/lib";

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

  constructor() {
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      this.channel = new BroadcastChannel(CHANNEL_NAME);

      logger.info("[Gateway:Broadcaster] Set broadcast channel.", {
        channelName: CHANNEL_NAME,
        broadcasterId: this.id,
      });
    }
  }

  public post<T>(type: BroadcastType, payload: T): void {
    if (!this.channel) {
      logger.warn("[Gateway:Broadcaster] No channel to post a message to.", {
        channelName: CHANNEL_NAME,
        broadcasterId: this.id,
        type,
        payload,
      });
      return;
    }

    this.channel.postMessage({ senderId: this.id, type, payload });

    logger.info("[Gateway:Broadcaster] Posted message to channel.", {
      channelName: CHANNEL_NAME,
      broadcasterId: this.id,
      type,
      payload,
    });
  }

  public subscribe(
    callback: (type: BroadcastType, payload: unknown) => void,
  ): () => void {
    if (!this.channel) {
      logger.warn("[Gateway:Broadcaster] No channel to subscribe to.", {
        channelName: CHANNEL_NAME,
        broadcasterId: this.id,
      });
      return () => {};
    }

    const listener = (event: MessageEvent<BroadcastMessage>) => {
      if (event.data && event.data.type) {
        callback(event.data.type, event.data.payload);

        logger.info(
          "[Gateway:Broadcaster] Received broadcasted message from channel.",
          {
            channelName: CHANNEL_NAME,
            broadcasterId: this.id,
            senderId: event.data.senderId,
            type: event.data.type,
            payload: event.data.payload,
          },
        );
      }
    };

    this.channel.addEventListener("message", listener);

    logger.info(
      "[Gateway:Broadcaster] Subscribed to broadcast channel messages.",
      {
        channelName: CHANNEL_NAME,
        broadcasterId: this.id,
      },
    );

    return () => {
      this.channel?.removeEventListener("message", listener);

      logger.info(
        "[Gateway:Broadcaster] Unsubscribed from broadcast channel messages.",
        {
          channelName: CHANNEL_NAME,
          broadcasterId: this.id,
        },
      );
    };
  }

  public close(): void {
    if (this.channel) {
      this.channel.close();
      this.channel = null;

      logger.info("[Gateway:Broadcaster] Closed broadcaster.", {
        channelName: CHANNEL_NAME,
        broadcasterId: this.id,
      });
    }
  }
}

export const broadcaster = new Broadcaster();
