import { Outlet } from "react-router";
import { DatePicker, Switch } from "antd";
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
    document.querySelector("body")?.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <main>
      <Switch onChange={handleThemeChanger} />
      <DatePicker />
      <p>Count Value : {0}</p>
      <Outlet />
    </main>
  );
}

export default App;
