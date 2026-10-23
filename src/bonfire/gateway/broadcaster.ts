import { logger } from "@/lib";

const CHANNEL_NAME = "bonfire_gateway_broadcast";

export const BroadcastType = {
  gatewayEvent: "GATEWAY_EVENT",
  gatewayStatusChange: "GATEWAY_STATUS_CHANGE",
  presenceSync: "PRESENCE_SYNC",
} as const;

export type BroadcastType = (typeof BroadcastType)[keyof typeof BroadcastType];

export interface BroadcastMessage<T = unknown> {
  type: BroadcastType;
  payload: T;
}

export class GatewayBroadcaster {
  private channel: BroadcastChannel | null = null;

  constructor() {
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      this.channel = new BroadcastChannel(CHANNEL_NAME);
      logger.info("[Gateway] Set broadcast channel!");
    }
  }

  public post<T>(type: BroadcastType, payload: T): void {
    if (!this.channel) return;
    this.channel.postMessage({ type, payload });
  }

  public subscribe(
    callback: (type: BroadcastType, payload: unknown) => void,
  ): () => void {
    if (!this.channel) return () => {};

    const listener = (event: MessageEvent<BroadcastMessage>) => {
      if (event.data && event.data.type) {
        callback(event.data.type, event.data.payload);
      }
    };

    this.channel.addEventListener("message", listener);
    return () => {
      this.channel?.removeEventListener("message", listener);
    };
  }

  public close(): void {
    if (this.channel) {
      this.channel.close();
      this.channel = null;
    }
  }
}

export const gatewayBroadcaster = new GatewayBroadcaster();
