# Learn Advanced React: state management with context

We're going to learn how to manage global application state with React context.

## Learning outcomes

- [ ] Why we might want to avoid "prop drilling"
- [ ] Using context to access global state
- [ ] Centralising state updates with reducers
- [ ] Using custom hooks to create Redux-like abstractions

## Part 0: setup

1. Clone this repo
1. `cd` into it and run `npm install`
1. Run `npm start` and open in your browser

You should see a counter that lets you increment and decrement a number. The app also displays a large copy of the count separately at the top right.

![](./screenshots/counter.gif)

## Part 1: find the bug

Open `src/Counter.jsx`. It contains quite a few small components. Our `count` state has to live in the top-level component (`CounterApp`) as it is needed in both branches of the component tree: inside `Counter` _and_ `BigCount`.

If we had separate copies of the state in each child (e.g. two calls to `useState`) then they would be separate numbers that would not stay in sync.

There's a bug in here somewhere: if you try the UI you should see that something doesn't work.

### Task

Find the bug and fix it so the counter works as expected.

<details>
  <summary>Solution</summary>

We forgot to pass `setCount` down to the `BigCount` component. This means `props.setCount` is `undefined` inside that child, so our `onClick` handler doesn't work.

You need to add this prop to `<BigCount>`

```jsx
function CounterApp() {
  const [count, setCount] = React.useState(0);
  return (
    <div>
      <Counter count={count} setCount={setCount} />
      <BigCount count={count} setCount={setCount} />
    </div>
  );
}
```

</details>

## Prop drilling

Since there are several levels of nesting we have to pass our state down via props through multiple components. This is often called "prop drilling". It can be both annoying and a source of bugs, as we just discovered.

We can avoid doing this using React context.

## React context

React components are isolated from each other. This isn't a special React feature, it's because they are functions and so all the variables they define are scoped to within themselves. If you want a function to have access to a value defined inside another you must pass it as an argument. E.g.

```js
function run() {
  const url = "https://example.com/stuff";
  getJson().then((data) => console.log(data));
}

function getJson() {
  fetch(url).then((res) => res.json);
}
```

Here `getJson` cannot access the `url` variable defined in `run`. We need to pass it in (`getJson(url)`) for this to work correctly.

React components are the same (since they're just functions):

```jsx
function App() {
  const size = "large";
  return <Text>Hello world</Text>;
}

function Text({ children }) {
  return <p class={size}>{children}</p>;
}
```

The only way for `<Text>` to have access to the `size` variable is if we pass it in as a prop (`<Text size={size}>`).

React context is a way to bypass this requirement and grab values from higher up the component tree without having to pass it all the way down as a prop.

### Creating context

We can create a context object like this:

```jsx
import React from "react";

const MyContext = React.createContext();
```

Note that this is defined _outside_ of any component. If we defined it inside a component it would be scoped to that function, which would make it useless for sharing values across different components.

### Providing context

We now need to _provide_ a value to a component tree using this context. The context object contains a `.Provider` property, which is a component we can use to do this:

```jsx
import React from "react";

const MyContext = React.createContext();

function App() {
  return (
    <MyContext.Provider value={5}>
      <Child />
    </MyContext.Provider>
  );
}
```

Whatever we pass as the `value` prop will be accessible by any children of the `Provider`. This pattern lets us control what children have access to the context—any components _outside_ of the `Provider` won't be able to get the value.

### Accessing context

Any children within the provider can now access the context value using the `React.useContext()` hook.

```jsx
import React from "react";

const MyContext = React.createContext();

function App() {
  return (
    <MyContext.Provider value={5}>
      <Child />
    </MyContext.Provider>
  );
}

function Child() {
  const test = React.useContext(MyContext);
  return <div>{test}</div>; // <div>5</div>
}
```

**Important**: You can have many different contexts in one app. The child needs access to the original context variable (`MyContext` here) so that `useContext` knows what value to provide. If the context is defined in a different file you should export it so that children can import it.

## Part 2: context refactor

Now we know how to use context we can solve our prop drilling problem in our counter.

### Task

Refactor your `src/Counter.jsx` components to use context to pass `count` and `setCount`. You shouldn't need to pass any props at all.

<details>
  <summary>Solution</summary>

You can store any value inside context, including stateful ones.

```jsx
function CountApp() {
  const [count, setCount] = React.useState(0);
  return (
    <div>
      <CountContext.Provider value={[count, setCount]}>
        <Counter />
        <BigCount />
      </CountContext.Provider>
    </div>
  );
}
```

There's not much point destructuring `count` and `setCount` out of the state array, since we don't actually use them here:

```jsx
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
```

Now each child component can grab whatever they need from the context, without any props being passed:

```jsx
function BigCount() {
  const [count] = React.useContext(CountContext);
  // ...
  );
}

function Decrement() {
  const [, setCount] = React.useContext(CountContext);
  // ...
}
```

</details>

## Centralising updates with reducers

Open `src/Todos.jsx`. This is a todo-list application that renders an array of todos that the user can add to and mark as complete.

![](./screenshots/todos.gif)

The code is an example of a common problem that develops as React apps grow. Each feature is broken down into separate components (adding todos, listing todos, toggling visibility). This is good, but since the shared state must live at the top level the updates can be hard to follow.

It's hard to see at a glance what updates are possible and how they work, even for a small app like this with only two types of updates.

It's sometimes useful to centralise state updates so they are all managed in one place. We can use the `React.useReducer()` hook for this.

### `useReducer`

This hook is similar to `React.useState()`. It's used to create a "stateful" value that React will keep track of. Any time this value changes our component will be re-rendered (just like with `useState`).

We pass it a "reducer" function and the initial state value. The reducer defines all the possible state changes that can happen (more below). The hook returns our state and a special `dispatch` function used to update the state. It puts them in a 2-item array, just like `useState`. You can read more [in the docs](https://reactjs.org/docs/hooks-reference.html#usereducer).

```jsx
function Counter() {
  const [count, dispatch] = React.useReducer(reducer, 0);
  return <div>{count}</div>;
}
```

Note: since we're using array destructuring we could name these variables anything we like. It's a convention to call the updater function "dispatch" (since that's what the popular Redux library called it).

### The reducer

A reducer is a function that lists all the possible ways the state can change. It receives the current state value and an "action" as arguments, then returns the new state based on the action. The convention is for the action to be an object with a `type` property that determines how the state updates. It can also have extra properties containing data required for the update.

Lets look at the counter example.

```js
function reducer(state, action) {
  if (action.type === "increment") {
    return state + 1;
  } else if (action.type === "decrement") {
    return state - 1;
  } else if (action.type === "custom_amount") {
    return state + action.amount;
  } else {
    return state;
  }
}
```

The reducer describes how the state should change for each possible type of "action" that might happen in the UI. Since many `if else` statements are repetitive and hard to read it's common to use a `switch` instead:

```js
function reducer(state, action) {
  switch (action.type) {
    case "increment":
      return state + 1;
    case "decrement":
      return state - 1;
    case "custom_amount":
      return state + action.amount;
  }
}
```

### `dispatch`

To trigger a state update our component must "dispatch" an action. This is done by calling the `dispatch` function that `useReducer` provided. E.g. `dispatch({ type: "increment" })`. This will tell React to call the reducer with the current state and whatever action was passed. We can pass extra properties in here too. For example `dispatch({ type: "custom_amount", amount: 10 })` will increment the count by 10.

This pattern allows us to centralise our state update logic and keep that stuff out of our UI/component code. It might seem like a lot of overhead for a trivial example like a basic counter, but as components gain more features and more stateful values it can become much easier to keep track of what changes can happen by putting them in one place.

It also allows you to share that logic—e.g. you may have multiple buttons both doing `setCount(count + 1)` (or a more complex update). It's easy for these to get out of sync if they're all defined separately.

## Part 3: reducer refactor

It would be nice to centralise the state updates for our todo list.

### Task

Use the `React.useReducer()` hook to move all the state updates in `src/Todos.jsx` into one place. You'll need to pass `dispatch` down via props instead of `setTodos`.

## Part 4: reducers and context

We still have the prop drilling problem here: we have to pass `dispatch` and our state down via props. It's not too bad here but if we wanted to break this component up more it might get unwieldy. The React docs actually [recommend passing dispatch down via context](https://reactjs.org/docs/hooks-faq.html#how-to-avoid-passing-callbacks-down) for deep updates.

### Task

Use context to pass your state and `dispatch` down without passing any props.

## Part 4: "Redux" hooks

The popular state management library Redux uses context to store your state globally, with reducer functions to handle updates to it.

It also uses custom hooks to expose this state object and a `dispatch` function (which works just like the built-in React one).

For example the `useSelector()` hook allows you to pass in a function that selects just the slice of your state object you want.

```jsx
function App() {
  const other = useSelector((state) => state.thing.other);
  return <div>{other}</div>;
}
```

The `useDispatch()` hook makes it easy for components to trigger state updates:

```jsx
function App() {
  const dispatch = useDispatch();
  return <button onClick={() => dispatch({ type: "thing" })}>Click me</button>;
}
```

### Custom hooks

> A custom Hook is a JavaScript function whose name starts with ”use” and that may call other Hooks  
> —[React docs on custom hooks](https://reactjs.org/docs/hooks-custom.html)

### Task

Create your own versions of `useSelector` and `useDispatch`.

`useSelector` should take a function as an argument. It should call this function with the entire state object and return the result. `useDispatch` should just return the `dispatch` function.

Refactor your app to use these new hooks.
