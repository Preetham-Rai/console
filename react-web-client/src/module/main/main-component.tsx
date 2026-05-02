import { Layout } from "antd";
import { Content, Header } from "antd/es/layout/layout";
import Sider from "antd/es/layout/Sider";
import { useState } from "react";
import { Outlet } from "react-router";

function MainComponent() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      <Layout className="main">
        <Header className="app-header">
          This is the header of the appplication
        </Header>
        <Layout>
          <Sider
            collapsible
            collapsed={collapsed}
            onCollapse={(value) => setCollapsed(value)}
            theme="light"
          ></Sider>
          <Content className="app-content">
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </>
  );
}

export default MainComponent;
