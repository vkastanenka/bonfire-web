import { logger as baseLogger, Logger } from "@/logger";
import { type Presence, presences } from "./presence";

const events = [
  "mousemove",
  "keydown",
  "mousedown",
  "touchstart",
  "scroll",
] as const;

const throttleMs = 2000;
// const defaultIdleTimeoutMs = 60000;
const defaultIdleTimeoutMs = 5000;

export type PresenceListener = (presence: Presence) => void;

export class PresenceTracker {
  private isRunning = false;
  private isIdle = false;
  private timeoutId: ReturnType<typeof setTimeout> | null = null;
  private lastActivityTime = 0;
  private readonly listeners = new Set<PresenceListener>();
  private readonly idleTimeoutMs: number;
  private readonly logger: Logger;

  constructor(
    idleTimeoutMs: number = defaultIdleTimeoutMs,
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
      // this.logger.debug("Window undefined, start aborted.");
      return;
    }

    if (this.isRunning) {
      // this.logger.debug("Service already running, start aborted.");
      return;
    }

    events.forEach((event) => {
      window.addEventListener(event, this.handleEvent, { passive: true });
    });

    this.resetTimeout();
    this.isRunning = true;

    // this.logger.info("Started presence service.");
  }

  public stop(): void {
    if (typeof window === "undefined") {
      // this.logger.debug("Window undefined, stop aborted.");
      return;
    }

    if (!this.isRunning) {
      // this.logger.debug("Service not running, stop aborted.");
      return;
    }

    events.forEach((event) => {
      window.removeEventListener(event, this.handleEvent);
    });

    this.clearTimeout();
    this.listeners.clear();
    this.isRunning = false;

    // this.logger.info("Stopped presence service.");
  }

  public subscribe(callback: PresenceListener, source?: string): () => void {
    const wrappedListener: PresenceListener = (presence) => {
      try {
        callback(presence);
        // this.logger.debug("Dispatched presence to listener.", {
        //   presence,
        //   source,
        // });
      } catch {
        // (error)
        // this.logger.error("Presence listener execution error.", {
        //   presence,
        //   source,
        //   error,
        // });
      }
    };

    this.listeners.add(wrappedListener);

    wrappedListener(this.isIdle ? presences.idle : presences.online);

    // this.logger.info("Subscribed to presence service.", {
    //   source,
    //   listenerCount: this.listeners.size,
    // });

    return () => {
      this.listeners.delete(wrappedListener);

      // this.logger.info("Unsubscribed from presence service.", {
      //   source,
      //   listenerCount: this.listeners.size,
      // });
    };
  }

  private handleEvent = (): void => {
    const now = Date.now();
    if (now - this.lastActivityTime < throttleMs) return;

    this.lastActivityTime = now;

    if (this.isIdle) {
      // this.logger.debug(
      //   "Activity detected while idle, transitioning to online.",
      // );
      this.updateIdleState(false);
    }

    this.resetTimeout();
  };

  private updateIdleState(isIdle: boolean): void {
    if (this.isIdle === isIdle) return;
    this.isIdle = isIdle;

    const presence = isIdle ? presences.idle : presences.online;

    this.listeners.forEach((listener) => listener(presence));

    // this.logger.info("Presence state updated and broadcasted.", {
    //   isIdle,
    //   presence,
    //   listenerCount: this.listeners.size,
    // });
  }

  private resetTimeout(): void {
    this.clearTimeout();
    this.timeoutId = setTimeout(() => {
      // this.logger.debug("Idle timeout reached, switching state to idle.");
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
