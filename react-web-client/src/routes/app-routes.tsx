import { createBrowserRouter } from "react-router";
import App from "../App";

const AppRouter = createBrowserRouter([
  {
    path: "/",
    Component: App,
  },
]);

export default AppRouter;
