import { Outlet } from "react-router";

function AuthComponent() {
  return (
    <div>
      <h1>Auth Component</h1>
      <Outlet />
    </div>
  );
}

export default AuthComponent;
