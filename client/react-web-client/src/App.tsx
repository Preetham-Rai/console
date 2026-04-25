import { Content } from "antd/es/layout/layout";
import { Outlet } from "react-router";

function App() {
  return (
    <>
      <Content className="app-content">
        <Outlet />
      </Content>
    </>
  );
}

export default App;
