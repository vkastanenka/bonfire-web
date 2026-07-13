import React, { useEffect, useState } from "react";
import { authService } from "../core";
import { setAccessToken, getAccessToken, clearAuth } from "../core/store";

interface AuthProviderProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function AuthProvider({ children, fallback = null }: AuthProviderProps) {
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const bootstrapAuth = async () => {
      const currentToken = getAccessToken();

      if (currentToken) {
        setIsInitializing(false);
        return;
      }

      try {
        const data = await authService.refresh();
        setAccessToken(data.access_token);
      } catch {
        clearAuth();
      } finally {
        setIsInitializing(false);
      }
    };

    bootstrapAuth();
  }, []);

  if (isInitializing) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
