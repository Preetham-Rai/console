import { createBrowserRouter, Navigate } from "react-router";
import App from "../App";
import { authRoutes } from "@/module/auth/auth.routes";
import { dashboardRoute } from "@/module/dashboard/dasboard.routes";

const AppRouter = createBrowserRouter([
  {
    path: "/",
    Component: App,
    children: [
      {
        index: true,
        element: <Navigate to="dashboard" replace />,
      },
      dashboardRoute,
      authRoutes,
    ],
  },
]);

export default AppRouter;
