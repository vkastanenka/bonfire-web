const channelName = "bonfire_broadcast";

export const broadcastTypes = {
  message: "MESSAGE",
  presence: "PRESENCE",
  status: "STATUS",
  sessionRevoked: "SESSION_REVOKED",
} as const;

export type BroadcastType =
  (typeof broadcastTypes)[keyof typeof broadcastTypes];

interface BroadcastMessage<T = unknown> {
  senderId: string;
  type: BroadcastType;
  payload: T;
}

export class Broadcaster {
  private readonly id: string = crypto.randomUUID();
  private channel: BroadcastChannel | null = null;

  constructor() {
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      this.channel = new BroadcastChannel(channelName);
    }
  }

  public subscribe(
    callback: (type: BroadcastType, payload: unknown) => void,
  ): () => void {
    if (!this.channel) return () => {};

    const listener = (event: MessageEvent<BroadcastMessage>) => {
      if (event.data && event.data.type) {
        try {
          callback(event.data.type, event.data.payload);
        } catch {
          // Ignore listener execution errors
        }
      }
    };

    this.channel.addEventListener("message", listener);
    return () => {
      this.channel?.removeEventListener("message", listener);
    };
  }

  public post<T>(type: BroadcastType, payload: T): void {
    if (!this.channel) return;
    this.channel.postMessage({ senderId: this.id, type, payload });
  }
}

export const broadcaster = new Broadcaster();
