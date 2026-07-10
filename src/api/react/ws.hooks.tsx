import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { getAccessToken } from "../core/store";
import { authService } from "../core";
import {
  buildWSUrl,
  type WSMessageOutbound,
  type WSMessageInbound,
} from "../core/ws";

interface WebSocketContextType {
  isConnected: boolean;
  send: (type: string, data: unknown) => void;
  lastMessage: WSMessageInbound | null;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WSMessageInbound | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isIntentionalDisconnect = useRef(false);

  const connect = useCallback(async () => {
    // If no access token exists, wait for login/register
    const token = getAccessToken();
    if (!token) return;

    try {
      // 1. Fetch short-lived ticket using your secure axios instance
      const { ticket } = await authService.wsTicket();

      if (isIntentionalDisconnect.current) return;

      // 2. Build connection URL and open socket
      const wsUrl = buildWSUrl({ ticketId: ticket, presence: "online" });
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        console.log("[WS] Connected to Bonfire Gateway");
      };

      ws.onmessage = (event) => {
        try {
          const parsed: WSMessageInbound = JSON.parse(event.data);
          setLastMessage(parsed);
        } catch (err) {
          console.error("[WS] Failed parsing inbound frame:", err);
        }
      };

      ws.onclose = (event) => {
        setIsConnected(false);
        wsRef.current = null;
        console.log(`[WS] Disconnected. Code: ${event.code}`);

        // Try reconnecting automatically if the closure wasn't expected
        if (!isIntentionalDisconnect.current) {
          reconnectTimeoutRef.current = setTimeout(() => {
            // connect();
          }, 5000); // Back off 5s
        }
      };

      ws.onerror = (error) => {
        console.error("[WS] Error observed:", error);
      };
    } catch (err) {
      console.error("[WS] Handshake ticket extraction failed:", err);
      // Retry ticket acquisition lifecycle
      // reconnectTimeoutRef.current = setTimeout(() => connect(), 10000);
    }
  }, []);

  const disconnect = useCallback(() => {
    isIntentionalDisconnect.current = true;
    if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
  }, []);

  // Expose clean type-safe writer wrapper matching backend Hub protocol
  const send = useCallback((type: string, data: unknown) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const payload: WSMessageOutbound = { t: type, d: data };
      wsRef.current.send(JSON.stringify(payload));
    } else {
      console.warn("[WS] Outbound frame dropped. Pipe state not OPEN.");
    }
  }, []);

  // Bind connection lifecycle strictly to global state Auth token availability
  useEffect(() => {
    isIntentionalDisconnect.current = false;
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return (
    <WebSocketContext.Provider value={{ isConnected, send, lastMessage }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error(
      "useWebSocket must be consumed inside a WebSocketProvider element.",
    );
  }
  return context;
};
