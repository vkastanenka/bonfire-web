import React, { useEffect, useState } from "react";
import { authService, type RefreshResponse } from "../core";
import { useTokenStore } from "./WebStrategy";

interface AuthProviderProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

let refreshPromise: Promise<RefreshResponse> | null = null;

export function AuthProvider({ children, fallback = null }: AuthProviderProps) {
  const { getAccessToken, setAccessToken, clearAuth } = useTokenStore();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const bootstrapAuth = async () => {
      const accessToken = getAccessToken();

      if (accessToken) {
        if (isMounted) setIsInitializing(false);
        return;
      }

      try {
        if (!refreshPromise) {
          refreshPromise = authService.refresh();
        }

        const data = await refreshPromise;

        if (isMounted) {
          setAccessToken(data.access_token);
        }
      } catch (error) {
        console.error(
          "[Auth Bootstrapper] Session restoration rejected:",
          error,
        );
        if (isMounted) {
          clearAuth();
        }
      } finally {
        refreshPromise = null;
        if (isMounted) {
          setIsInitializing(false);
        }
      }
    };

    bootstrapAuth();

    return () => {
      isMounted = false;
    };
  }, [getAccessToken, setAccessToken, clearAuth]);

  if (isInitializing) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
