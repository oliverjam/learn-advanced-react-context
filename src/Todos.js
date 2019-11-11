import React from "react";

function Todos() {
  const [todos, setTodos] = React.useState([]);
  const [showCompleted, setShowCompleted] = React.useState(true);
  return (
    <div className="todos">
      <h1>Todo list</h1>
      <AddTodo setTodos={setTodos} />
      <TodoList
        todos={todos}
        setTodos={setTodos}
        showCompleted={showCompleted}
      />
      <ToggleCompleted
        showCompleted={showCompleted}
        setShowCompleted={setShowCompleted}
      />
    </div>
  );
}

function AddTodo({ setTodos }) {
  function addTodo(event) {
    event.preventDefault();
    const text = event.target.elements.addTodo.value;
    const newTodo = { id: Date.now().toString(), text, complete: false };
    setTodos(oldTodos => [...oldTodos, newTodo]);
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
          required
        />
      </label>
      <button type="submit">Add +</button>
    </form>
  );
}

function TodoList({ todos, setTodos, showCompleted }) {
  return (
    <ul>
      {todos
        .filter(todo => (showCompleted ? true : !todo.complete))
        .map(todo => (
          <li key={todo.id} className="todos__item">
            <span
              style={{
                textDecoration: todo.complete && "line-through",
              }}
            >
              {todo.text}
            </span>
            <ToggleTodo
              setTodos={setTodos}
              id={todo.id}
              checked={todo.complete}
            />
          </li>
        ))}
    </ul>
  );
}

function ToggleTodo({ id, setTodos, checked }) {
  function toggleTodo() {
    setTodos(oldTodos =>
      oldTodos.map(t => (t.id === id ? { ...t, complete: !t.complete } : t))
    );
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

function ToggleCompleted({ showCompleted, setShowCompleted }) {
  return (
    <button onClick={() => setShowCompleted(!showCompleted)}>
      {showCompleted ? "Hide" : "Show"} completed todos
    </button>
  );
}

export default Todos;
