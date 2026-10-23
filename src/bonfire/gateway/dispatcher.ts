import { logger as baseLogger, Logger } from "@/lib";

type MessageHandler<T = unknown> = (data: T) => void;

export class Dispatcher {
  private handlers = new Map<string, Set<MessageHandler<unknown>>>();
  private logger: Logger;

  constructor(logger: Logger = baseLogger) {
    this.logger = logger.child({
      package: "Gateway",
      module: "Dispatcher",
    });
  }

  public register<T = unknown>(
    type: string,
    handler: MessageHandler<T>,
    source?: string,
  ): () => void {
    let handlers = this.handlers.get(type);

    if (!handlers) {
      handlers = new Set<MessageHandler<unknown>>();
      this.handlers.set(type, handlers);
    }

    const castHandler = handler as MessageHandler<unknown>;
    handlers.add(castHandler);

    this.logger.info("Registered message handler.", { type, source });

    return () => {
      const currentHandlers = this.handlers.get(type);
      if (currentHandlers) {
        currentHandlers.delete(castHandler);
        this.logger.info("Unregistered message handler.", { type, source });
        if (currentHandlers.size === 0) {
          this.handlers.delete(type);
        }
      }
    };
  }

  public dispatch(type: string, data: unknown, source?: string): void {
    const handlers = this.handlers.get(type);
    if (!handlers) {
      this.logger.warn(`No message handlers for type.`, { type, source });
      return;
    }

    handlers.forEach((handler) => {
      try {
        handler(data);
      } catch (error) {
        this.logger.error(`Message handler execution error.`, {
          error,
          source,
        });
      }
    });
  }
}

export const dispatcher = new Dispatcher();
