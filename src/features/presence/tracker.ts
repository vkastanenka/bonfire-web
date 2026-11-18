import { presences, type Presence } from "@/bonfire-sdk";

const events = [
  "mousemove",
  "keydown",
  "mousedown",
  "touchstart",
  "scroll",
] as const;

const throttleMs = 2000;
const defaultIdleTimeoutMs = 120000;

export type PresenceListener = (presence: Presence) => void;

export class PresenceTracker {
  private isRunning = false;
  private isIdle = false;
  private timeoutId: ReturnType<typeof setTimeout> | null = null;
  private lastActivityTime = 0;
  private readonly listeners = new Set<PresenceListener>();
  private readonly idleTimeoutMs: number;

  constructor(idleTimeoutMs: number = defaultIdleTimeoutMs) {
    this.idleTimeoutMs = idleTimeoutMs;
  }

  public start(): void {
    if (typeof window === "undefined") {
      return;
    }

    if (this.isRunning) {
      return;
    }

    events.forEach((event) => {
      window.addEventListener(event, this.handleEvent, { passive: true });
    });

    this.resetTimeout();
    this.isRunning = true;
  }

  public stop(): void {
    if (typeof window === "undefined") {
      return;
    }

    if (!this.isRunning) {
      return;
    }

    events.forEach((event) => {
      window.removeEventListener(event, this.handleEvent);
    });

    this.clearTimeout();
    this.listeners.clear();
    this.isRunning = false;
  }

  public subscribe(callback: PresenceListener): () => void {
    this.listeners.add(callback);

    callback(this.isIdle ? presences.idle : presences.online);

    return () => {
      this.listeners.delete(callback);
    };
  }

  private handleEvent = (): void => {
    const now = performance.now();
    if (now - this.lastActivityTime < throttleMs) return;

    this.lastActivityTime = now;

    if (this.isIdle) {
      this.updateIdleState(false);
    }

    this.resetTimeout();
  };

  private updateIdleState(isIdle: boolean): void {
    if (this.isIdle === isIdle) return;
    this.isIdle = isIdle;

    const presence = isIdle ? presences.idle : presences.online;
    this.listeners.forEach((listener) => listener(presence));
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

export const presenceTracker = new PresenceTracker();
