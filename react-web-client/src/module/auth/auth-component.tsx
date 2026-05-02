import { Button, Layout } from "antd";
import "./styles/auth.scss";
import { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router";

function AuthComponent() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleAuthToggle = (pathname: string) => {
    navigate(pathname, { replace: true });
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      navigate("/app/dashboard", { replace: true });
    }
  }, [navigate]);

  const isLogin = location.pathname === "/auth/login";

  // const handleAuthSuccess = () => {
  //   // After successful login/registration, navigate to app
  //   navigate("/app", { replace: true });
  // };

  return (
    <Layout className="auth-layout">
      <Outlet />
      <div className="auth-toggle">
        {isLogin ? (
          <p>
            Don't have an account?{" "}
            <Button
              type="primary"
              onClick={() => handleAuthToggle("/auth/register")}
            >
              Toggle auth
            </Button>
          </p>
        ) : (
          <p>
            Already have an account?{" "}
            <Button
              type="primary"
              onClick={() => handleAuthToggle("/auth/login")}
            >
              Toggle auth
            </Button>
          </p>
        )}
      </div>
    </Layout>
  );
}

export default AuthComponent;
