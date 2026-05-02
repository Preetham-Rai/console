import { createBrowserRouter, Navigate } from "react-router";
import App from "../App";
import { dashboardRoute } from "@/module/dashboard/dasboard.routes";
import { discussionRoutes } from "@/module/discussion/discussion.routes";
import ProtectedRoute from "@/protected-route";
import AuthComponent from "@/module/auth/auth-component";
import Login from "@/module/auth/login-component";
import RegistrationComponent from "@/module/auth/registration-component";

const AppRouter = createBrowserRouter([
  {
    path: "/",
    Component: App,
    children: [
      {
        path: "auth",
        Component: AuthComponent,
        children: [
          {
            index: true,
            element: <Navigate to="/auth/login" replace />,
          },
          {
            path: "login",
            Component: Login,
          },
          {
            path: "register",
            Component: RegistrationComponent,
          },
        ],
      },
      {
        path: "app",
        Component: ProtectedRoute,
        children: [
          {
            index: true,
            element: <Navigate to="/app/dashboard" replace />,
          },
          dashboardRoute,
          discussionRoutes,
        ],
      },
      {
        path: "/",
        element: <Navigate to="/auth/login" replace />,
      },
    ],
  },
]);

export default AppRouter;
