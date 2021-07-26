import React from "react";

const TodoContext = React.createContext();

function reducer(state, action) {
  switch (action.type) {
    case "add":
      return { ...state, todos: [...state.todos, action.payload] };
    case "toggle":
      return {
        ...state,
        todos: state.todos.map(t =>
          t.id === action.payload ? { ...t, complete: !t.complete } : t
        ),
      };
    case "toggle_completed":
      return { ...state, showCompleted: !state.showCompleted };
    default:
      return state;
  }
}

const initialState = {
  todos: [],
  showCompleted: true,
};

function useSelector(selector) {
  const { state } = React.useContext(TodoContext);
  return selector(state);
}

function useDispatch() {
  const { dispatch } = React.useContext(TodoContext);
  return dispatch;
}

function Todos() {
  const [state, dispatch] = React.useReducer(reducer, initialState);
  return (
    <TodoContext.Provider value={{ state, dispatch }}>
      <div className="todos">
        <h1>Todo list</h1>
        <AddTodo />
        <TodoList />
        <ToggleCompleted />
      </div>
    </TodoContext.Provider>
  );
}

function AddTodo() {
  const dispatch = useDispatch();
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
          required
        />
      </label>
      <button type="submit">Add +</button>
    </form>
  );
}

function TodoList() {
  const dispatch = useDispatch();
  const todos = useSelector(state => state.todos);
  const showCompleted = useSelector(state => state.showCompleted);
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
  const dispatch = useDispatch();
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

function ToggleCompleted() {
  const dispatch = useDispatch();
  const showCompleted = useSelector(state => state.showCompleted);
  return (
    <button onClick={() => dispatch({ type: "toggle_completed" })}>
      {showCompleted ? "Hide" : "Show"} completed todos
    </button>
  );
}

export default Todos;
