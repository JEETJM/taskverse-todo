import { useEffect, useState } from "react";
import axios from "axios";
import {
  Plus,
  Trash2,
  Pencil,
  CheckCircle2,
  Clock3,
  ListTodo,
  Search,
  Sparkles,
  CalendarDays,
  // GithubIcon,
  // Linkedin,
  // Instagram,
  Rocket,
} from "lucide-react";

const API_URL = "/api/todos";

function App() {
  const [todos, setTodos] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "Personal",
    priority: "Medium",
    status: "Pending",
    dueDate: "",
  });

  const fetchTodos = async () => {
    try {
      const res = await axios.get(API_URL);
      setTodos(res.data);
    } catch {
      alert("Backend server not connected");
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchTodos();
    };

    loadData();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      category: "Personal",
      priority: "Medium",
      status: "Pending",
      dueDate: "",
    });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim()) {
      alert("Task title is required");
      return;
    }

    const payload = {
      ...form,
      dueDate: form.dueDate || null,
    };

    try {
      if (editingId) {
        await axios.put(`${API_URL}/${editingId}`, payload);
      } else {
        await axios.post(API_URL, payload);
      }

      resetForm();
      fetchTodos();
    } catch (error) {
      alert(error.response?.data?.message || "Task save failed");
    }
  };

  const handleEdit = (todo) => {
    setEditingId(todo._id);
    setForm({
      title: todo.title || "",
      description: todo.description || "",
      category: todo.category || "Personal",
      priority: todo.priority || "Medium",
      status: todo.status || "Pending",
      dueDate: todo.dueDate ? todo.dueDate.slice(0, 10) : "",
    });
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this task?")) return;

    try {
      await axios.delete(`${API_URL}/${id}`);
      fetchTodos();
    } catch {
      alert("Delete failed");
    }
  };

  const filteredTodos = todos.filter((todo) => {
    const title = todo.title || "";
    const description = todo.description || "";

    const searchMatch =
      title.toLowerCase().includes(search.toLowerCase()) ||
      description.toLowerCase().includes(search.toLowerCase());

    const statusMatch = statusFilter === "All" || todo.status === statusFilter;

    const priorityMatch =
      priorityFilter === "All" || todo.priority === priorityFilter;

    return searchMatch && statusMatch && priorityMatch;
  });

  const totalTasks = todos.length;
  const pendingTasks = todos.filter((todo) => todo.status === "Pending").length;
  const completedTasks = todos.filter(
    (todo) => todo.status === "Completed",
  ).length;

  return (
    <div className="app">
      <nav className="navbar">
        <div className="brand">
          <div className="brand-logo">
            <Rocket size={28} />
          </div>

          <div>
            <h2>TaskVerse</h2>
            <p>MERN Todo Management Website</p>
          </div>
        </div>

        <div className="nav-links">
          <a href="https://github.com/JEETJM" target="_blank" rel="noreferrer">
             GitHub
          </a>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-glass">
          <span className="hero-badge">
            <Sparkles size={16} /> MongoDB Atlas + React + Express
          </span>

          <h1>Plan Smarter. Work Faster. Finish Better.</h1>

          <p>
            A professional MERN stack todo website with beautiful UI, task
            priorities, categories, status filters, due dates and cloud
            database.
          </p>

          <div className="hero-buttons">
            <a href="#tasks">Manage Tasks</a>

            <a
              href="https://github.com/JEETJM"
              target="_blank"
              rel="noreferrer"
            >
              View GitHub
            </a>
          </div>
        </div>
      </section>

      <section className="stats">
        <div className="stat-card">
          <div className="stat-icon blue">
            <ListTodo />
          </div>

          <div>
            <h3>{totalTasks}</h3>
            <p>Total Tasks</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon orange">
            <Clock3 />
          </div>

          <div>
            <h3>{pendingTasks}</h3>
            <p>Pending Tasks</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">
            <CheckCircle2 />
          </div>

          <div>
            <h3>{completedTasks}</h3>
            <p>Completed Tasks</p>
          </div>
        </div>
      </section>

      <main className="main-layout" id="tasks">
        <form className="task-form" onSubmit={handleSubmit}>
          <div className="section-title">
            <h2>{editingId ? "Update Task" : "Create Task"}</h2>
            <p>Add your task details below.</p>
          </div>

          <label>Task Title</label>
          <input
            type="text"
            name="title"
            placeholder="Example: Complete MERN project"
            value={form.title}
            onChange={handleChange}
          />

          <label>Description</label>
          <textarea
            name="description"
            placeholder="Write task details..."
            value={form.description}
            onChange={handleChange}
          />

          <label>Category</label>
          <select name="category" value={form.category} onChange={handleChange}>
            <option>Personal</option>
            <option>Study</option>
            <option>Work</option>
            <option>Project</option>
            <option>Other</option>
          </select>

          <label>Priority</label>
          <select name="priority" value={form.priority} onChange={handleChange}>
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>

          <label>Status</label>
          <select name="status" value={form.status} onChange={handleChange}>
            <option>Pending</option>
            <option>In Progress</option>
            <option>Completed</option>
          </select>

          <label>Due Date</label>
          <input
            type="date"
            name="dueDate"
            value={form.dueDate}
            onChange={handleChange}
          />

          <button className="submit-btn" type="submit">
            <Plus size={18} />
            {editingId ? "Update Task" : "Add Task"}
          </button>

          {editingId && (
            <button className="cancel-btn" type="button" onClick={resetForm}>
              Cancel Edit
            </button>
          )}
        </form>

        <section className="task-panel">
          <div className="panel-header">
            <div>
              <h2>All Tasks</h2>
              <p>Search, filter, edit and delete your tasks.</p>
            </div>
          </div>

          <div className="filters">
            <div className="search-box">
              <Search size={18} />

              <input
                type="text"
                placeholder="Search task..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option>All</option>
              <option>Pending</option>
              <option>In Progress</option>
              <option>Completed</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option>All</option>
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </div>

          <div className="task-list">
            {filteredTodos.length === 0 ?
              <div className="empty-box">
                <h3>No tasks found</h3>
                <p>Create your first beautiful task now.</p>
              </div>
            : filteredTodos.map((todo) => (
                <div className="task-card" key={todo._id}>
                  <div className="task-content">
                    <div className="task-title-row">
                      <h3>{todo.title}</h3>

                      <span
                        className={`priority ${(
                          todo.priority || "Medium"
                        ).toLowerCase()}`}
                      >
                        {todo.priority || "Medium"}
                      </span>
                    </div>

                    <p>{todo.description || "No description added."}</p>

                    <div className="meta-row">
                      <span className="category">
                        {todo.category || "Personal"}
                      </span>

                      <span className="status">{todo.status || "Pending"}</span>

                      {todo.dueDate && (
                        <span className="due">
                          <CalendarDays size={14} />
                          {new Date(todo.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="task-actions">
                    <button
                      className="edit-btn"
                      type="button"
                      onClick={() => handleEdit(todo)}
                    >
                      <Pencil size={16} />
                    </button>

                    <button
                      className="delete-btn"
                      type="button"
                      onClick={() => handleDelete(todo._id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            }
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="footer-brand">
          <div className="brand-logo">
            <Rocket size={28} />
          </div>

          <h2>TaskVerse</h2>
        </div>

        <p>
          Developed by <strong>Jeet Mondal</strong> | MERN Stack Todo Website
        </p>

        <div className="footer-links">
          <a href="https://github.com/JEETJM" target="_blank" rel="noreferrer">
            GitHub
          </a>

          <a
            href="https://www.linkedin.com/in/jm1904/"
            target="_blank"
            rel="noreferrer"
          >
            LinkedIn
          </a>

          <a
            href="https://www.instagram.com/igx_jeet/"
            target="_blank"
            rel="noreferrer"
          >
           Instagram
          </a>
        </div>
      </footer>
    </div>
  );
}

export default App;
