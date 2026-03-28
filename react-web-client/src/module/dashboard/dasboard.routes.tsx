import type { RouteObject } from "react-router";
import DashboardComponent from "./dashboard-component";

export const dashboardRoute: RouteObject = {
  path: "dashboard",
  Component: DashboardComponent,
};
