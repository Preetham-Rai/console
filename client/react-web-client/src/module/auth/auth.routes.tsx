import { Navigate, type RouteObject } from "react-router";
import AuthComponent from "./auth-component";
import Login from "./login-component";
import RegistrationComponent from "./registration-component";

export const authRoutes: RouteObject = {
  path: "auth",
  Component: AuthComponent,
  children: [
    {
      index: true,
      element: <Navigate to="registration" replace />,
    },
    {
      path: "registration",
      Component: RegistrationComponent,
    },
    {
      path: "login",
      Component: Login,
    },
  ],
};
