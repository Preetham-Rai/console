import { createBrowserRouter, Navigate } from "react-router";
import App from "../App";
import { authRoutes } from "@/module/auth/auth.routes";
import { dashboardRoute } from "@/module/dashboard/dasboard.routes";
import { discussionRoutes } from "@/module/discussion/discussion.routes";

const AppRouter = createBrowserRouter([
  {
    path: "/",
    Component: App,
    children: [
      {
        index: true,
        element: <Navigate to="discussion" replace />,
      },
      dashboardRoute,
      authRoutes,
      discussionRoutes,
    ],
  },
]);

export default AppRouter;
