import React, { createContext, useContext } from "react";
import axios from "axios";
import type { HttpAuthStrategy } from "../core/client";
import { refreshResponseSchema } from "../http/schema";

export interface TokenStore {
  getAccessToken: () => string | null;
  setAccessToken: (token: string) => void;
  clearAuth: () => void;
}

const TokenStoreContext = createContext<TokenStore | null>(null);

export function TokenStoreProvider({
  children,
  store,
}: {
  children: React.ReactNode;
  store: TokenStore;
}) {
  return (
    <TokenStoreContext.Provider value={store}>
      {children}
    </TokenStoreContext.Provider>
  );
}

export function useTokenStore() {
  const context = useContext(TokenStoreContext);
  if (!context) {
    throw new Error("useTokenStore must be used within a TokenStoreProvider");
  }
  return context;
}

interface WebStrategyOptions {
  baseURL: string;
  tokenStore: TokenStore;
  bypassRoutes?: string[];
  onAuthFailure?: (error: unknown) => void;
}

export function createWebAuthStrategy({
  baseURL,
  tokenStore,
  bypassRoutes = ["/auth/refresh", "/auth/login", "/auth/register"],
  onAuthFailure,
}: WebStrategyOptions): HttpAuthStrategy {
  return {
    getAccessToken: () => tokenStore.getAccessToken(),

    shouldBypassAuth: (config) => {
      return bypassRoutes.some((route) => config.url?.includes(route));
    },

    refreshTokens: async () => {
      const response = await axios.post(
        `${baseURL}/auth/refresh`,
        {},
        { withCredentials: true },
      );
      const parsed = refreshResponseSchema.parse(response.data);

      tokenStore.setAccessToken(parsed.access_token);
      return parsed.access_token;
    },

    onAuthFailure: (error) => {
      tokenStore.clearAuth();
      if (onAuthFailure) {
        onAuthFailure(error);
      }
    },
  };
}
