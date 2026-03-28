import { Outlet } from "react-router";
import { Layout } from "antd";
import { Content, Header } from "antd/es/layout/layout";
import Sider from "antd/es/layout/Sider";

function App() {
  return (
    <>
      <Sider
        theme="light"
        width={"50px"}
        style={{ borderRight: "1px solid grey" }}
      >
        hey
      </Sider>
      <Layout className="main">
        <Header className="app-header">
          This is the header of the appplication
        </Header>
        <Content>
          <Outlet />
        </Content>
      </Layout>
    </>
  );
}

export default App;
