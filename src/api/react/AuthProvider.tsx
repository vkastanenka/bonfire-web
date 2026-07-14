import React, { useEffect, useState } from "react";
import { sessionManager } from "../session/manager";

interface AuthProviderProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function AuthProvider({ children, fallback = null }: AuthProviderProps) {
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function initialize() {
      await sessionManager.bootstrapSession();

      if (isMounted) {
        setIsInitializing(false);
      }
    }

    initialize();

    return () => {
      isMounted = false;
    };
  }, []);

  if (isInitializing) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
