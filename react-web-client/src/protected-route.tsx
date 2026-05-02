import { Navigate, Outlet } from "react-router";

function ProtectedRoute() {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/auth/login" replace />;
  }
  return <Outlet />;
}

export default ProtectedRoute;
