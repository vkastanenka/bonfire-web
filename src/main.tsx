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
import { ApiNetworkError } from "@/api";

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
    // if (
    //   (error.status === 400 || error.status === 422) &&
    //   error.details.invalid_params?.length
    // ) {
    //   return;
    // }
    toast.error(error.details.detail || error.message);
  } else if (error instanceof Error) {
    toast.error(error.message);
  } else {
    toast.error("An unexpected service ecosystem anomaly occurred.");
  }
};

const queryClient = new QueryClient({
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
  context: { queryClient },
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </QueryClientProvider>
  </StrictMode>,
);
