export const Presence = {
  online: "ONLINE",
  offline: "OFFLINE",
  idle: "IDLE",
  busy: "BUSY",
  dnd: "DND",
  invisible: "INVISIBLE",
} as const;

export type Presence = (typeof Presence)[keyof typeof Presence];

export type PresenceListener = (presence: Presence) => void;

const PRESENCE_EVENTS = [
  "mousemove",
  "keydown",
  "mousedown",
  "touchstart",
  "scroll",
] as const;

const THROTTLE_MS = 2000;
const DEFAULT_IDLE_TIMEOUT_MS = 60000;

class PresenceService {
  private isRunning = false;
  private isIdle = false;
  private timeoutId: ReturnType<typeof setTimeout> | null = null;
  private lastActivityTime = 0;
  private readonly listeners = new Set<PresenceListener>();
  private readonly idleTimeoutMs: number;

  constructor(idleTimeoutMs: number = DEFAULT_IDLE_TIMEOUT_MS) {
    this.idleTimeoutMs = idleTimeoutMs;
  }

  public start(): void {
    if (typeof window === "undefined" || this.isRunning) return;

    PRESENCE_EVENTS.forEach((event) => {
      window.addEventListener(event, this.handleEvent, { passive: true });
    });

    this.resetTimeout();
    this.isRunning = true;
  }

  public stop(): void {
    if (typeof window === "undefined" || !this.isRunning) return;

    PRESENCE_EVENTS.forEach((event) => {
      window.removeEventListener(event, this.handleEvent);
    });

    this.clearTimeout();
    this.listeners.clear();
    this.isRunning = false;
  }

  public subscribe(callback: PresenceListener): () => void {
    this.listeners.add(callback);
    callback(this.isIdle ? Presence.idle : Presence.online);
    return () => this.listeners.delete(callback);
  }

  private handleEvent = (): void => {
    const now = Date.now();
    if (now - this.lastActivityTime < THROTTLE_MS) return;
    this.lastActivityTime = now;

    if (this.isIdle) {
      this.updateIdleState(false);
    }

    this.resetTimeout();
  };

  private updateIdleState(isIdle: boolean): void {
    if (this.isIdle === isIdle) return;
    this.isIdle = isIdle;

    const presence = isIdle ? Presence.idle : Presence.online;
    this.listeners.forEach((callback) => callback(presence));
  }

  private resetTimeout(): void {
    this.clearTimeout();
    this.timeoutId = setTimeout(() => {
      this.updateIdleState(true);
    }, this.idleTimeoutMs);
  }

  private clearTimeout(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }
}

export const presenceService = new PresenceService();
