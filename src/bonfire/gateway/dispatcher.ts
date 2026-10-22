// import { gatewayService, type GatewayMessage } from "./service";
// import {
//   authGatewayMessageSchemas,
//   type AuthGatewayMessageType,
//   type AuthGatewayPayloads,
// } from "../auth/validation";

// type MessageType = AuthGatewayMessageType;
// type MessagePayloads = AuthGatewayPayloads;

// type MessageHandler<T = MessagePayloads> = (data: T) => void;

// class GatewayDispatcher {
//   private isInit = false;
//   private handlers = new Map<
//     AuthGatewayMessageType,
//     Set<MessageHandler<unknown>>
//   >();

//   public initialize(): void {
//     if (this.isInit) return;

//     gatewayService.subscribeToMessages((message: GatewayMessage) => {
//       this.dispatch(message.t, message.d);
//     });

//     this.isInit = true;
//   }

//   public register<K extends MessageType>(
//     type: K,
//     handler: MessageHandler<MessagePayloads[K]>,
//   ): () => void {
//     let handlers = this.handlers.get(type);

//     if (!handlers) {
//       handlers = new Set<MessageHandler<unknown>>();
//       this.handlers.set(type, handlers);
//     }

//     const wrappedHandler: MessageHandler<unknown> = (data) => {
//       handler(data as MessagePayloads[K]);
//     };

//     handlers.add(wrappedHandler);

//     return () => {
//       handlers?.delete(wrappedHandler);

//       if (handlers?.size === 0) {
//         this.handlers.delete(type);
//       }
//     };
//   }

//   private dispatch(type: string, data: unknown): void {
//     if (!Object.hasOwn(authGatewayMessageSchemas, type)) {
//       return;
//     }

//     const messageType = type as AuthGatewayMessageType;
//     const schema = authGatewayMessageSchemas[messageType];
//     const result = schema.safeParse(data);

//     if (!result.success) {
//       console.warn(`Invalid gateway payload for "${type}"`, result.error);
//       return;
//     }

//     this.handlers.get(messageType)?.forEach((handler) => {
//       handler(result.data);
//     });
//   }
// }

// export const gatewayDispatcher = new GatewayDispatcher();

/**
 * Feature Specific Store
 */

// import { create } from "zustand";
// import { gatewayDispatcher } from "@/api/gateway/dispatcher";

// export interface ChatMessage {
//   id: string;
//   content: string;
//   userId: string;
// }

// interface ChatState {
//   messages: ChatMessage[];
//   appendMessage: (message: ChatMessage) => void;
// }

// export const useMessageStore = create<ChatState>((set) => ({
//   messages: [],
//   appendMessage: (message) =>
//     set((state) => ({ messages: [...state.messages, message] })),
// }));

// // Register event handler cleanly in the domain module
// gatewayDispatcher.register<ChatMessage>("MESSAGE_CREATE", (payload) => {
//   useMessageStore.getState().appendMessage(payload);
// });
