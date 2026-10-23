import { logger } from "@/lib";

type MessageHandler<T = unknown> = (data: T) => void;

export class GatewayDispatcher {
  private handlers = new Map<string, Set<MessageHandler<unknown>>>();

  public register<T = unknown>(
    type: string,
    handler: MessageHandler<T>,
  ): () => void {
    let handlers = this.handlers.get(type);

    if (!handlers) {
      handlers = new Set<MessageHandler<unknown>>();
      this.handlers.set(type, handlers);
    }

    const castHandler = handler as MessageHandler<unknown>;
    handlers.add(castHandler);

    return () => {
      const currentHandlers = this.handlers.get(type);
      if (currentHandlers) {
        currentHandlers.delete(castHandler);
        if (currentHandlers.size === 0) {
          this.handlers.delete(type);
        }
      }
    };
  }

  public dispatch(type: string, data: unknown): void {
    const handlers = this.handlers.get(type);
    if (!handlers) {
      logger.warn(
        `[GatewayDispatcher] No message handlers for provided type.`,
        { type },
      );
      return;
    }

    handlers.forEach((handler) => {
      try {
        handler(data);
      } catch (error) {
        logger.error(`[GatewayDispatcher] Handler execution error.`, { error });
      }
    });
  }
}

export const gatewayDispatcher = new GatewayDispatcher();
