import { createRoot } from "react-dom/client";
import "./styles/index.css";
import { RouterProvider } from "react-router";
import AppRouter from "./routes/app-routes.tsx";

createRoot(document.getElementById("root")!).render(
  <RouterProvider router={AppRouter} />,
);
