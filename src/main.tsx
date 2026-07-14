import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import {
  QueryClient,
  QueryClientProvider,
  QueryCache,
  MutationCache,
} from "@tanstack/react-query";

import "@fontsource/quicksand/300.css";
import "@fontsource/quicksand/400.css";
import "@fontsource/quicksand/500.css";
import "@fontsource/quicksand/700.css";

import { routeTree } from "./routeTree.gen";
import { toast, ToastProvider } from "./lib";
import { ApiNetworkError, authManager } from "@/api";

declare module "@tanstack/react-query" {
  interface Register {
    mutationMeta: {
      skipGlobalToast?: boolean;
    };
    queryMeta: {
      skipGlobalToast?: boolean;
    };
  }
}

const handleGlobalError = (error: unknown) => {
  if (error instanceof ApiNetworkError) {
    toast.error(error.details.detail || error.message);
  } else if (error instanceof Error) {
    toast.error(error.message);
  } else {
    toast.error("An unexpected service ecosystem anomaly occurred.");
  }
};

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      if (query.meta?.skipGlobalToast) return;
      handleGlobalError(error);
    },
  }),
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) => {
      if (mutation.meta?.skipGlobalToast) return;
      handleGlobalError(error);
    },
  }),
});

const router = createRouter({
  routeTree,
  context: {
    queryClient,
    auth: {
      isAuthenticated: false,
      accessToken: null,
    },
  },
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const App = () => {
  const accessToken = authManager.getAccessToken();
  const isAuthenticated = !!accessToken;

  return (
    <RouterProvider
      router={router}
      context={{
        auth: {
          isAuthenticated,
          accessToken,
        },
      }}
    />
  );
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <App />
      </ToastProvider>
    </QueryClientProvider>
  </StrictMode>,
);
