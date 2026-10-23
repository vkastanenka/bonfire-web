import { logger as baseLogger, Logger } from "@/lib";

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

const PresenceEvents = [
  "mousemove",
  "keydown",
  "mousedown",
  "touchstart",
  "scroll",
] as const;

const THROTTLE_MS = 2000;
const DEFAULT_IDLE_TIMEOUT_MS = 60000;

export class PresenceService {
  private isRunning = false;
  private isIdle = false;
  private timeoutId: ReturnType<typeof setTimeout> | null = null;
  private lastActivityTime = 0;
  private readonly listeners = new Set<PresenceListener>();
  private readonly idleTimeoutMs: number;
  private logger: Logger;

  constructor(
    idleTimeoutMs: number = DEFAULT_IDLE_TIMEOUT_MS,
    logger: Logger = baseLogger,
  ) {
    this.idleTimeoutMs = idleTimeoutMs;
    this.logger = logger.child({
      package: "Gateway",
      module: "Presence",
    });
  }

  public start(): void {
    if (typeof window === "undefined") {
      this.logger.warn("Window undefined, start aborted.");
      return;
    }

    if (this.isRunning) {
      this.logger.warn("Service already running, start aborted.");
      return;
    }

    PresenceEvents.forEach((event) => {
      window.addEventListener(event, this.handleEvent, { passive: true });
    });

    this.resetTimeout();
    this.isRunning = true;

    this.logger.info("Started service.");
  }

  public stop(): void {
    if (typeof window === "undefined") {
      this.logger.warn("Window undefined, stop aborted.");
      return;
    }

    if (!this.isRunning) {
      this.logger.warn("Service not running, stop aborted.");
      return;
    }

    PresenceEvents.forEach((event) => {
      window.removeEventListener(event, this.handleEvent);
    });

    this.clearTimeout();
    this.listeners.clear();
    this.isRunning = false;

    this.logger.info("Stopped service.");
  }

  public subscribe(callback: PresenceListener, source?: string): () => void {
    this.listeners.add(callback);
    callback(this.isIdle ? Presence.idle : Presence.online);

    this.logger.info("Subscribed to service.", { source });

    return () => {
      this.listeners.delete(callback);
      this.logger.info("Unsubscribed from service.", { source });
    };
  }

  private handleEvent = (): void => {
    const now = Date.now();
    if (now - this.lastActivityTime < THROTTLE_MS) return;

    this.lastActivityTime = now;

    if (this.isIdle) {
      this.logger.debug(
        "Activity detected while idle, transitioning to online.",
      );
      this.updateIdleState(false);
    }

    this.resetTimeout();
  };

  private updateIdleState(isIdle: boolean): void {
    if (this.isIdle === isIdle) return;
    this.isIdle = isIdle;

    const presence = isIdle ? Presence.idle : Presence.online;

    this.logger.info("Presence state updated.", {
      isIdle,
      presence,
      listenerCount: this.listeners.size,
    });

    this.listeners.forEach((callback) => callback(presence));
  }

  private resetTimeout(): void {
    this.clearTimeout();
    this.timeoutId = setTimeout(() => {
      this.logger.debug("Idle timeout reached, switching state to idle.");
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
