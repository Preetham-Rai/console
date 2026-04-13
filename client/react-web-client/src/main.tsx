import { createRoot } from "react-dom/client";
import "./styles/index.scss";
import { RouterProvider } from "react-router";
import AppRouter from "./routes/app.routes.tsx";
import ErrorManager from "./ErrorManager.tsx";

createRoot(document.getElementById("root")!).render(
  <ErrorManager>
    <RouterProvider router={AppRouter} />
  </ErrorManager>,
);
