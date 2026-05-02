import { Navigate, type RouteObject } from "react-router";
import MainComponent from "./main-component";
import { dashboardRoute } from "../dashboard/dasboard.routes";

export const mainRoute: RouteObject = {
  path: "/main",
  element: <MainComponent />,
  children: [
    {
      index: true,
      element: <Navigate to="auth" replace />,
    },
    dashboardRoute,
  ],
};
