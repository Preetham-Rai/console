import { Layout } from "antd";
import { Outlet } from "react-router";
import "./styles/auth.scss";

function AuthComponent() {
  return (
    <Layout className="auth-layout">
      <Outlet />
    </Layout>
  );
}

export default AuthComponent;
