import type { RouteObject } from "react-router";
import AuthComponent from "./auth-component";
import Login from "./login-component";

export const authRoutes: RouteObject = {
  path: "auth",
  Component: AuthComponent,
  children: [
    {
      path: "login",
      Component: Login,
    },
  ],
};
