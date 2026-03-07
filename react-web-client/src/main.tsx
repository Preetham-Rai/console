import { createRoot } from "react-dom/client";
import "./styles/index.scss";
import { RouterProvider } from "react-router";
import AppRouter from "./routes/app-routes.tsx";
import ErrorManager from "./ErrorManager.tsx";
import { Provider } from "react-redux";
import { store } from "./app/store.ts";

createRoot(document.getElementById("root")!).render(
  <ErrorManager>
    <Provider store={store}>
      <RouterProvider router={AppRouter} />
    </Provider>
  </ErrorManager>,
);
