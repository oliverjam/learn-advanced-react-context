import React from "react";

function App() {
  const [count, setCount] = React.useState(0);
  return (
    <div>
      <Counter count={count} setCount={setCount} />
      <BigCount count={count} />
    </div>
  );
}

function BigCount({ count }) {
  return (
    <div style={{ position: "absolute", right: 64, top: 64, fontSize: 64 }}>
      {count}
    </div>
  );
}

function Counter({ count, setCount }) {
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      <Decrement setCount={setCount} />
      <Display count={count} />
      <Increment />
    </div>
  );
}

function Decrement({ setCount }) {
  return (
    <button
      className="counter__button"
      onClick={() => setCount(oldCount => oldCount - 1)}
    >
      -
    </button>
  );
}

function Increment({ setCount }) {
  return (
    <button
      className="counter__button"
      onClick={() => setCount(oldCount => oldCount + 1)}
    >
      +
    </button>
  );
}

function Display({ count }) {
  return (
    <span style={{ margin: "0 1rem", fontVariantNumeric: "tabular-nums" }}>
      {count}
    </span>
  );
}

export default App;
