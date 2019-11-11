import React from "react";

const TodoContext = React.createContext();

function reducer(state, action) {
  switch (action.type) {
    case "add":
      return [...state, action.payload];
    case "toggle":
      return state.map(t =>
        t.id === action.payload ? { ...t, complete: !t.complete } : t
      );
    default:
      return state;
  }
}

function Todos() {
  const [todos, dispatch] = React.useReducer(reducer, []);
  return (
    <TodoContext.Provider value={{ todos, dispatch }}>
      <div className="todos">
        <h1>Todo list</h1>
        <AddTodo />
        <TodoList />
      </div>
    </TodoContext.Provider>
  );
}

function TodoList() {
  const { todos, dispatch } = React.useContext(TodoContext);
  return (
    <ul>
      {todos.map(todo => (
        <li key={todo.id} className="todos__item">
          <span
            style={{
              textDecoration: todo.complete && "line-through",
            }}
          >
            {todo.text}
          </span>
          <ToggleTodo
            dispatch={dispatch}
            id={todo.id}
            checked={todo.complete}
          />
        </li>
      ))}
    </ul>
  );
}

function ToggleTodo({ id, checked }) {
  const { dispatch } = React.useContext(TodoContext);
  function toggleTodo() {
    dispatch({ type: "toggle", payload: id });
  }
  return (
    <input
      type="checkbox"
      onChange={toggleTodo}
      checked={checked}
      aria-label="toggle complete"
    />
  );
}

function AddTodo() {
  const { dispatch } = React.useContext(TodoContext);
  function addTodo(event) {
    event.preventDefault();
    const text = event.target.elements.addTodo.value;
    const newTodo = { id: Date.now().toString(), text, complete: false };
    dispatch({ type: "add", payload: newTodo });
    event.target.reset();
  }
  return (
    <form onSubmit={addTodo}>
      <label htmlFor="add-todo">
        Add todo
        <input
          className="todos__input"
          id="add-todo"
          type="text"
          name="addTodo"
        />
      </label>
      <button type="submit">Add +</button>
    </form>
  );
}

export default Todos;
