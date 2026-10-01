import { z } from "zod";

export const Presence = {
  Online: "online",
  Offline: "offline",
  Idle: "idle",
  Busy: "busy",
  Dnd: "dnd",
  Invisible: "invisible",
} as const;

export type Presence = (typeof Presence)[keyof typeof Presence];

export const presenceSchema = z.enum(
  Object.values(Presence) as [Presence, ...Presence[]],
);

export type Activity = Extract<Presence, "online" | "idle">;

export type ActivityCallback = (activity: Activity) => void;

class ActivityTracker {
  private readonly idleTimeoutMs: number = 60000;
  private timeoutId: ReturnType<typeof setTimeout> | null = null;
  private isIdle = false;
  private listeners = new Set<ActivityCallback>();
  private lastActivityTime = Date.now();

  constructor(idleTimeoutMs: number = 60000) {
    this.idleTimeoutMs = idleTimeoutMs;
  }

  public start() {
    if (typeof window === "undefined") return;

    const events = [
      "mousemove",
      "keydown",
      "mousedown",
      "touchstart",
      "scroll",
    ];
    events.forEach((event) => {
      window.addEventListener(event, this.handleActivity, { passive: true });
    });

    this.resetTimeout();
  }

  public stop() {
    if (typeof window === "undefined") return;

    const events = [
      "mousemove",
      "keydown",
      "mousedown",
      "touchstart",
      "scroll",
    ];
    events.forEach((event) => {
      window.removeEventListener(event, this.handleActivity);
    });

    this.clearTimeouts();
    this.listeners.clear();
  }

  public subscribe(callback: ActivityCallback): () => void {
    this.listeners.add(callback);
    callback(this.isIdle ? Presence.Idle : Presence.Online);
    return () => this.listeners.delete(callback);
  }

  private handleActivity = () => {
    const now = Date.now();
    if (now - this.lastActivityTime < 2000) return;
    this.lastActivityTime = now;

    if (this.isIdle) {
      this.isIdle = false;
      this.notify(Presence.Online);
    }

    this.resetTimeout();
  };

  private resetTimeout() {
    if (this.timeoutId) clearTimeout(this.timeoutId);
    this.timeoutId = setTimeout(() => {
      this.isIdle = true;
      this.notify(Presence.Idle);
    }, this.idleTimeoutMs);
  }

  private clearTimeouts() {
    if (this.timeoutId) clearTimeout(this.timeoutId);
  }

  private notify(activity: Activity) {
    this.listeners.forEach((callback) => callback(activity));
  }
}

export const activityTracker = new ActivityTracker();
