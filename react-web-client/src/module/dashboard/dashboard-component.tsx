import { Splitter } from "antd";

function DashboardComponent() {
  return (
    <Splitter>
      <Splitter.Panel
        defaultSize="30%"
        min="15%"
        max={"70%"}
        style={{
          padding: "0.75rem",
        }}
      >
        Hello Left
      </Splitter.Panel>
      <Splitter.Panel>Hello Right</Splitter.Panel>
    </Splitter>
  );
}

export default DashboardComponent;
