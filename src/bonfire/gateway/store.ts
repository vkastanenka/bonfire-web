import { create } from "zustand";
import { authService, useAuthStore } from "../auth";
import { gatewayService, GatewayStatus } from "./service";
import { Presence, presenceService } from "./presence";

interface GatewayState {
  status: GatewayStatus;
  presence: Presence;
  init: () => void;
  close: () => void;
  send: (type: string, data: unknown) => void;
  sendPresence: () => void;
}

let isInit = false;

export const useGatewayStore = create<GatewayState>((set, get) => ({
  status: GatewayStatus.disconnected,
  presence: Presence.online,

  init: () => {
    if (!isInit) {
      gatewayService.subscribeToStatus((status: GatewayStatus) => {
        set({ status });
      });

      presenceService.subscribe((presence: Presence) => {
        const effectivePresence =
          authService.getEffectivePresence() ?? presence;

        if (get().presence !== effectivePresence) {
          set({ presence: effectivePresence });
          get().sendPresence();
        }
      });

      presenceService.start();
      isInit = true;
    }

    const initialPresence =
      authService.getEffectivePresence() ?? Presence.online;

    set({
      status: gatewayService.getStatus(),
      presence: initialPresence,
    });

    gatewayService.connect(initialPresence);
  },

  close: () => {
    presenceService.stop();
    set({
      status: GatewayStatus.disconnected,
      presence: Presence.online,
    });
    gatewayService.disconnect();
  },

  send: (type, data) => {
    gatewayService.send(type, data);
  },

  sendPresence: () => {
    if (get().status === GatewayStatus.connected) {
      get().send("UPDATE_PRESENCE", { presence: get().presence });
    }
  },
}));

let previousToken = useAuthStore.getState().accessToken;

useAuthStore.subscribe((state) => {
  if (previousToken && !state.accessToken) {
    useGatewayStore.getState().close();
  }
  previousToken = state.accessToken;
});

// ### 1. Managing Backend Connection Limits (Graceful Eviction)

// To prevent bad actors or accidental tab-storming from overwhelming your server while avoiding frustrating legitimate users with hard refresh modals, modern systems use a **FIFO (First-In, First-Out) Eviction Policy**.

// #### How the Backend Should Handle It

// * **Session Threshold:** Set a reasonable cap per user session or user ID (e.g., max 5 active WebSocket connections).
// * **Eviction Strategy:** When a user opens a 6th tab, instead of rejecting the connection with a 429 error or crashing, the Go backend accepts the new connection and **gracefully closes the oldest existing connection** for that session.
// * **Custom Close Code:** Send a specific WebSocket close code and reason, such as code `4008` with the reason `"Replaced by a newer connection"`.

// #### How the Frontend Should Handle Eviction

// When your TypeScript `GatewayService` receives a close event with code `4008`, it should handle it differently than a standard network drop:

// 1. **Suppress Auto-Reconnect:** Set `forcedClose = true` (or a specific `isEvicted` flag) so the old tab doesn't enter an aggressive reconnection loop competing with the active tab.
// 2. **Subtle UI State:** Instead of a blocking modal, render a quiet, non-intrusive banner at the top of the app: *"You've opened Bonfire in another window. Click here to reconnect."* Clicking it simply calls `gatewayService.connect()` to reclaim the slot.

// ---

// ### 2. Synchronizing State Across Multiple Open Tabs

// If a user has Tab A and Tab B open simultaneously and chats in Tab A, Tab B needs to stay synchronized instantly. Because you are building a real-time Go backend with Redis and a React frontend with TanStack Query and Zustand, you have two layers of synchronization working together:

// #### Layer 1: Real-Time Server Broadcast (Redis Pub/Sub)

// Since both Tab A and Tab B maintain independent WebSocket connections to your Go backend, your backend architecture handles multi-tab distribution automatically:

// 1. When Tab A sends a message, your Go backend processes it and publishes the event to a Redis Pub/Sub channel.
// 2. Your backend hub broadcasts that message payload to **all active client connections** registered under that user or chat room.
// 3. As a result, Tab B receives the message live over its own WebSocket stream the exact same moment Tab A does, updating both tabs simultaneously.

// #### Layer 2: Instant Local Sync via `BroadcastChannel` (Zero Server Overhead)

// To make multi-tab synchronization lightning-fast and save server bandwidth for local UI state (like reading messages, changing presence, or drafting text), use the native browser `BroadcastChannel` API.

// You can wire this directly into your Zustand stores:

// ```ts
// // shared/broadcast.ts
// const channel = new BroadcastChannel("bonfire_sync_channel");

// export function broadcastAction(type: string, payload: unknown) {
//   channel.postMessage({ type, payload });
// }

// export function initTabSync(onMessage: (type: string, payload: unknown) => void) {
//   channel.onmessage = (event) => {
//     onMessage(event.data.type, event.data.payload);
//   };
// }

// ```

// Inside your `useGatewayStore` or chat stores, when an action happens in one tab, you broadcast it:

// ```ts
// // Inside a store action
// receiveMessage: (message) => {
//   set((state) => ({ messages: [...state.messages, message] }));
//   broadcastAction("NEW_MESSAGE", message);
// }

// ```

// And initialize the listener on app startup (e.g., in your root layout):

// ```ts
// useEffect(() => {
//   initTabSync((type, payload) => {
//     if (type === "NEW_MESSAGE") {
//       // Instantly inject into store or invalidate TanStack Query cache
//       queryClient.invalidateQueries({ queryKey: ["messages"] });
//     }
//   });
// }, []);

// ```

// #### Layer 3: Catch-Up on Reconnect or Tab Focus

// If Tab B was put to sleep by the browser or lost connection while 10 messages were sent in Tab A, relying solely on real-time events isn't enough. You ensure catch-up through your existing lifecycle hooks:

// * When `visibilitychange` fires and Tab B becomes visible again, trigger a lightweight TanStack Query refetch (`queryClient.invalidateQueries()`) to pull the delta from the REST API.
// * When the WebSocket reconnects after a drop, execute a sync pass so any missed events are immediately fetched.

/**
 * **Yes, absolutely. You have just landed on the architectural gold standard for multi-tab web applications: the Leader Tab Pattern.**

Using `BroadcastChannel` combined with a single active WebSocket connection per user session (managed by whichever tab is currently active or was opened first) completely eliminates the need for backend FIFO limits, connection caps, and awkward eviction error messages.

### Why the Leader Tab Architecture Wins

1. **Massive Server Efficiency:** Instead of scaling your Go backend to handle 3 to 10 connections per user when they have multiple tabs open, your server handles **exactly 1 WebSocket connection per user session**, no matter how many tabs they open.
2. **Zero Eviction Friction:** There are no race conditions, no forced disconnects with close code `4008`, and no need for UI error banners telling the user their session moved.
3. **Immaculate Resource Management:** Background tabs consume zero network socket overhead and minimal CPU, which mobile and desktop browsers reward by not throttling or killing your app.

---

### How to Implement It Cleanly

Implementing this requires two simple pieces: **Leader Election** and **Event Broadcasting**.

#### 1. Leader Election (Using the Browser's Web Locks API)

Modern browsers provide the **Web Locks API** (`navigator.locks`), which makes leader election trivial and robust without complex polling:

```ts
// shared/leader-election.ts
export async function claimLeadership(onTakeOver: () => void, onLose: () => void) {
  if (typeof navigator === "undefined" || !navigator.locks) {
    // Fallback for very old environments
    onTakeOver();
    return;
  }

  // navigator.locks.request holds the lock as long as this tab is open & focused
  navigator.locks.request("bonfire_ws_leader_lock", { mode: "exclusive" }, async (lock) => {
    onTakeOver();
    
    // This promise resolves only when the lock is stolen or tab is closed
    return new Promise<void>((resolve) => {
      // Listen for a signal from another tab wanting to take over
      window.addEventListener("bonfire-abdicate-leadership", () => {
        onLose();
        resolve();
      }, { once: true });
    });
  });
}

```

#### 2. Orchestrating It in Your `AuthLayout` or `useGateway`

When a tab mounts, it attempts to claim leadership.

* **If it wins the lock:** It becomes the **Leader**. It boots up `gatewayService.connect()` and listens for incoming WebSocket events. When a message arrives from the Go backend, it immediately fires `broadcastChannel.postMessage(...)` to share it with any background follower tabs.
* **If it's a background tab:** It becomes a **Follower**. It does *not* open a WebSocket. Instead, it listens to the `BroadcastChannel` to keep its Zustand store and React Query cache synchronized.
* **When a user clicks/focuses a follower tab:** That tab can immediately request leadership (or claim it on `visibilitychange`), causing the old leader tab to gracefully close its WebSocket and step down into a follower role.

This creates a completely self-healing, hyper-efficient multi-tab ecosystem that requires zero complex backend policing.
 */
