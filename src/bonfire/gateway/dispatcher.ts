import { logger as baseLogger, Logger } from "@/lib";

type Handler<T = unknown> = (data: T) => void;

export class Dispatcher {
  private readonly handlers = new Map<string, Set<Handler<unknown>>>();
  private readonly logger: Logger;

  constructor(logger: Logger = baseLogger) {
    this.logger = logger.child({
      package: "Gateway",
      module: "Dispatcher",
    });
  }

  public register<T = unknown>(
    type: string,
    handler: Handler<T>,
    source?: string,
  ): () => void {
    let handlers = this.handlers.get(type);

    if (!handlers) {
      handlers = new Set<Handler<unknown>>();
      this.handlers.set(type, handlers);
    }

    const castHandler = handler as Handler<unknown>;

    const wrappedHandler: Handler<unknown> = (data) => {
      try {
        castHandler(data);
        this.logger.debug("Dispatched message to handler.", {
          type,
          source,
        });
      } catch (error) {
        this.logger.error("Message handler execution error.", {
          type,
          source,
          error,
        });
      }
    };

    handlers.add(wrappedHandler);

    this.logger.info("Registered message handler.", {
      type,
      source,
      handlerCount: handlers.size,
    });

    return () => {
      const currentHandlers = this.handlers.get(type);

      if (currentHandlers) {
        currentHandlers.delete(wrappedHandler);

        this.logger.info("Unregistered message handler.", {
          type,
          source,
          handlerCount: currentHandlers.size,
        });

        if (currentHandlers.size === 0) {
          this.handlers.delete(type);
        }
      }
    };
  }

  public dispatch(type: string, data: unknown): void {
    const handlers = this.handlers.get(type);
    if (!handlers) {
      this.logger.warn("No message handlers for type.", { type });
      return;
    }

    handlers.forEach((handler) => handler(data));
  }
}

export const dispatcher = new Dispatcher();
