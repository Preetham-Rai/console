import { createBrowserRouter, Navigate } from "react-router";
import App from "../App";
import { authRoutes } from "@/module/auth/auth-module-router";

const AppRouter = createBrowserRouter([
  {
    path: "/",
    Component: App,
    children: [
      {
        index: true,
        element: <Navigate to="auth/login" replace />,
      },
      authRoutes,
    ],
  },
]);

export default AppRouter;
