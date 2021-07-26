import React from "react";

const CountContext = React.createContext();

function CountApp() {
  const countState = React.useState(0);
  return (
    <div>
      <CountContext.Provider value={countState}>
        <Counter />
        <BigCount />
      </CountContext.Provider>
    </div>
  );
}

function BigCount() {
  const [count] = React.useContext(CountContext);
  return (
    <div style={{ position: "absolute", right: 64, top: 64, fontSize: 64 }}>
      {count}
    </div>
  );
}

function Counter() {
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      <Decrement />
      <Display />
      <Increment />
    </div>
  );
}

function Decrement() {
  const [, setCount] = React.useContext(CountContext);
  return <button onClick={() => setCount((c) => c - 1)}>-</button>;
}

function Increment() {
  const [, setCount] = React.useContext(CountContext);
  return <button onClick={() => setCount((c) => c + 1)}>+</button>;
}

function Display() {
  const [count] = React.useContext(CountContext);
  return <span style={{ margin: "0 1rem" }}>{count}</span>;
}

export default CountApp;
