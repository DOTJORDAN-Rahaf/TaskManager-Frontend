import { useEffect, useState } from "react";
import "./App.css";

const API_URL =
  import.meta.env.VITE_API_URL || "https://taskmanager-backend-98x0.onrender.com";

function App() {
  const [mode, setMode] = useState("login");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [tasks, setTasks] = useState([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [status, setStatus] = useState("pending");

  const [message, setMessage] = useState("");

  const getErrorMessage = async (res) => {
    try {
      const data = await res.json();
      return data.message || "Something went wrong";
    } catch {
      return "Something went wrong";
    }
  };

  const getTasks = async () => {
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/api/tasks`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.message === "Task not found") {
          setTasks([]);
          setMessage("");
          return;
        }

        throw new Error(data.message || "Failed to get tasks");
      }

      setTasks(Array.isArray(data) ? data : data.tasks || []);
    } catch (error) {
      setMessage(error.message);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      if (!res.ok) {
        throw new Error(await getErrorMessage(res));
      }

      setMessage("Account created successfully. Please login.");
      setMode("login");
      setName("");
      setPassword("");
    } catch (error) {
      setMessage(error.message);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }

      localStorage.setItem("token", data.token);
      setToken(data.token);
      setPassword("");
      setMessage("");
    } catch (error) {
      setMessage(error.message);
    }
  };

  const createTask = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await fetch(`${API_URL}/api/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description,
          priority,
          status,
        }),
      });

      if (!res.ok) {
        throw new Error(await getErrorMessage(res));
      }

      setTitle("");
      setDescription("");
      setPriority("medium");
      setStatus("pending");
      setMessage("Task added successfully.");
      getTasks();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const markCompleted = async (task) => {
    const taskId = task._id || task.id;

    try {
      const res = await fetch(`${API_URL}/api/tasks/${taskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: task.title,
          description: task.description,
          priority: task.priority || "medium",
          status: "completed",
        }),
      });

      if (!res.ok) {
        throw new Error(await getErrorMessage(res));
      }

      setMessage("Task completed successfully.");
      getTasks();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const deleteTask = async (task) => {
    const taskId = task._id || task.id;

    try {
      const res = await fetch(`${API_URL}/api/tasks/${taskId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error(await getErrorMessage(res));
      }

      setMessage("Task deleted successfully.");
      getTasks();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken("");
    setTasks([]);
    setMessage("");
  };

  useEffect(() => {
    getTasks();
  }, [token]);

  return (
    <div className="page">
      <header className="header">
        <div>
          <h1>Task Manager</h1>
          <p>Manage your daily tasks easily</p>
        </div>

        {token && (
          <button className="logout-btn" onClick={logout}>
            Logout
          </button>
        )}
      </header>

      <main className="container">
        {message && <div className="message">{message}</div>}

        {!token ? (
          <section className="auth-card">
            <div className="auth-title">
              <h2>{mode === "login" ? "Welcome Back" : "Create Account"}</h2>
              <p>
                {mode === "login"
                  ? "Login to continue to your tasks."
                  : "Register to start managing your tasks."}
              </p>
            </div>

            <div className="tabs">
              <button
                type="button"
                className={mode === "login" ? "active" : ""}
                onClick={() => setMode("login")}
              >
                Login
              </button>

              <button
                type="button"
                className={mode === "register" ? "active" : ""}
                onClick={() => setMode("register")}
              >
                Register
              </button>
            </div>

            <form onSubmit={mode === "login" ? handleLogin : handleRegister}>
              {mode === "register" && (
                <div className="field">
                  <label>Name</label>
                  <input
                    type="text"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              )}

              <div className="field">
                <label>Email</label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="field">
                <label>Password</label>
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button className="main-btn" type="submit">
                {mode === "login" ? "Login" : "Create Account"}
              </button>
            </form>
          </section>
        ) : (
          <section className="dashboard">
            <div className="form-card">
              <h2>Add New Task</h2>

              <form onSubmit={createTask}>
                <div className="field">
                  <label>Title</label>
                  <input
                    type="text"
                    placeholder="Enter task title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="field">
                  <label>Description</label>
                  <textarea
                    placeholder="Enter task description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  ></textarea>
                </div>

                <div className="row">
                  <div className="field">
                    <label>Priority</label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>

                  <div className="field">
                    <label>Status</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                    >
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>

                <button className="main-btn" type="submit">
                  Add Task
                </button>
              </form>
            </div>

            <div className="list-card">
              <div className="list-header">
                <h2>My Tasks</h2>
                <span>{tasks.length} task(s)</span>
              </div>

              {tasks.length === 0 ? (
                <div className="empty-box">
                  <h3>No tasks yet</h3>
                  <p>Add your first task from the form.</p>
                </div>
              ) : (
                <div className="tasks-list">
                  {tasks.map((task) => (
                    <div className="task-card" key={task._id || task.id}>
                      <div className="task-content">
                        <h3>{task.title}</h3>
                        <p>{task.description || "No description added."}</p>

                        <div className="badges">
                          <span>{task.status || "pending"}</span>
                          <span>{task.priority || "medium"}</span>
                        </div>
                      </div>

                      <div className="actions">
                        <button
                          className="complete-btn"
                          onClick={() => markCompleted(task)}
                        >
                          Complete
                        </button>

                        <button
                          className="delete-btn"
                          onClick={() => deleteTask(task)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;