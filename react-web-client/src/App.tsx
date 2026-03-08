import { Outlet } from "react-router";
import { DatePicker, Switch, Layout } from "antd";
import { useAppSelector, useAppDispatch } from "./app/hooks";
import { toggleTheme } from "./store/themeSlice";
import { useEffect } from "react";

function App() {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.theme.mode);

  const handleThemeChanger = () => {
    dispatch(toggleTheme());
  };

  useEffect(() => {
    document.querySelector(".main")?.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <Layout className="main">
      {/* <Switch style={{ width: "20px" }} onChange={handleThemeChanger} />
      <DatePicker style={{ width: "200px" }} /> */}
      <Outlet />
    </Layout>
  );
}

export default App;
