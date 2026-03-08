import { Outlet } from "react-router";
import { Layout } from "antd";
import { useAppSelector } from "./app/hooks";
import { useEffect } from "react";

function App() {
  const theme = useAppSelector((state) => state.theme.mode);

  useEffect(() => {
    document.querySelector(".main")?.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <Layout className="main">
      <Outlet />
    </Layout>
  );
}

export default App;
