import { useState } from "react";
// import Childcomponent from "./components/child-component";
// import Secondcomponent from "./components/second-component";

// import { useMemo, useCallback } from "react";

function DashboardComponent() {
  let [count, setCount] = useState(0);
  // let [one, setOne] = useState({
  //   name: "John Doe",
  //   age: 23,
  // });

  // const mutateProp = useCallback((data: string) => {
  //   setOne((prev) => ({ ...prev, name: data }));
  // }, []);

  // const secondData = useMemo(() => {
  //   return {
  //     name: one.name,
  //     age: one.age,
  //     mutateProp,
  //   };
  // }, [one.name, one.age, mutateProp]);

  return (
    <div>
      {/* <Childcomponent parentCount={count} /> */}
      {/* <Secondcomponent data={secondData} /> */}
      <div>Hello React</div>
    </div>
  );
}

export default DashboardComponent;
