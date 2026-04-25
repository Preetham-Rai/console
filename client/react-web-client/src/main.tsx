import { createRoot } from "react-dom/client";
import "./styles/index.scss";
import { RouterProvider } from "react-router";
import AppRouter from "./routes/app.routes.tsx";
import ErrorManager from "./ErrorManager.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <ErrorManager>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={AppRouter} />
    </QueryClientProvider>
  </ErrorManager>,
);
