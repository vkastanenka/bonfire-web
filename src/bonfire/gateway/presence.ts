import { authService } from "../auth";
import { useGatewayStore } from "./store";

export const Presence = {
  online: "ONLINE",
  offline: "OFFLINE",
  idle: "IDLE",
  busy: "BUSY",
  dnd: "DND",
  invisible: "INVISIBLE",
} as const;

export type Presence = (typeof Presence)[keyof typeof Presence];

export function resolvePresence(): Presence {
  const preferred = authService.getEffectivePresence();

  if (preferred) {
    return preferred;
  }

  return useGatewayStore.getState().presence;
}

const presenceEvents = [
  "mousemove",
  "keydown",
  "mousedown",
  "touchstart",
  "scroll",
];

export type PresenceListener = (presence: Presence) => void;

class PresenceService {
  private isRunning = false;
  private readonly idleTimeoutMs: number = 60000;
  private timeoutId: ReturnType<typeof setTimeout> | null = null;
  private isIdle = false;
  private listeners = new Set<PresenceListener>();
  private lastActivityTime = Date.now();

  constructor(idleTimeoutMs: number = 60000) {
    this.idleTimeoutMs = idleTimeoutMs;
  }

  public start() {
    if (typeof window === "undefined" || this.isRunning) return;

    presenceEvents.forEach((event) => {
      window.addEventListener(event, this.handleEvent, { passive: true });
    });

    this.resetTimeout();
    this.isRunning = true;
  }

  public stop() {
    if (typeof window === "undefined" || !this.isRunning) return;

    presenceEvents.forEach((event) => {
      window.removeEventListener(event, this.handleEvent);
    });

    this.clearTimeouts();
    this.listeners.clear();
    this.isRunning = false;
  }

  public subscribe(callback: PresenceListener): () => void {
    this.listeners.add(callback);
    callback(this.isIdle ? Presence.idle : Presence.online);
    return () => this.listeners.delete(callback);
  }

  private handleEvent = () => {
    const now = Date.now();
    if (now - this.lastActivityTime < 2000) return;
    this.lastActivityTime = now;

    if (this.isIdle) {
      this.isIdle = false;
      this.dispatch(Presence.online);
    }

    this.resetTimeout();
  };

  private resetTimeout() {
    if (this.timeoutId) clearTimeout(this.timeoutId);
    this.timeoutId = setTimeout(() => {
      this.isIdle = true;
      this.dispatch(Presence.idle);
    }, this.idleTimeoutMs);
  }

  private clearTimeouts() {
    if (this.timeoutId) clearTimeout(this.timeoutId);
  }

  private dispatch(presence: Presence) {
    this.listeners.forEach((callback) => callback(presence));
  }
}

export const presenceService = new PresenceService();
