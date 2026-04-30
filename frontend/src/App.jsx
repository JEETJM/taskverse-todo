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
  Rocket
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "/api";

function App() {
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState({
    name: "",
    email: "",
    password: ""
  });

  const [profileOpen, setProfileOpen] = useState(false);
  const [profileEdit, setProfileEdit] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);

  const [profileForm, setProfileForm] = useState({
    name: "",
    about: ""
  });

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
    dueDate: ""
  });

  const token = user?.token || localStorage.getItem("taskverseToken");

  const getAuthHeaders = () => ({
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const getAvatar = () => {
    return (
      user?.avatar ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(
        user?.name || "User"
      )}&background=7c3aed&color=fff&bold=true`
    );
  };

  const saveUser = (data) => {
    localStorage.setItem("taskverseUser", JSON.stringify(data));
    localStorage.setItem("taskverseToken", data.token);
    setUser(data);
  };

  const logout = () => {
    localStorage.removeItem("taskverseUser");
    localStorage.removeItem("taskverseToken");
    setUser(null);
    setTodos([]);
    setProfileOpen(false);
  };

  const handleAuthChange = (e) => {
    setAuthForm({
      ...authForm,
      [e.target.name]: e.target.value
    });
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();

    try {
      const endpoint = authMode === "login" ? "/auth/login" : "/auth/register";

      const payload =
        authMode === "login"
          ? {
              email: authForm.email,
              password: authForm.password
            }
          : authForm;

      const res = await axios.post(`${API_BASE}${endpoint}`, payload);

      saveUser(res.data);
      setAuthForm({
        name: "",
        email: "",
        password: ""
      });
    } catch (error) {
      alert(error.response?.data?.message || "Authentication failed");
    }
  };

  const fetchTodos = async () => {
    if (!token) return;

    try {
      const res = await axios.get(`${API_BASE}/todos`, getAuthHeaders());
      setTodos(res.data);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to load tasks");

      if (error.response?.status === 401) {
        logout();
      }
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("taskverseUser");

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchTodos();
    }
  }, [user]);

  const openProfileEdit = () => {
    setProfileForm({
      name: user.name || "",
      about: user.about || ""
    });

    setAvatarFile(null);
    setProfileEdit(true);
    setProfileOpen(false);
  };

  const handleProfileChange = (e) => {
    setProfileForm({
      ...profileForm,
      [e.target.name]: e.target.value
    });
  };

  const uploadAvatar = async () => {
    if (!avatarFile) return null;

    const formData = new FormData();
    formData.append("avatar", avatarFile);

    const res = await axios.put(
      `${API_BASE}/auth/profile/avatar`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      }
    );

    saveUser(res.data);
    return res.data;
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.put(
        `${API_BASE}/auth/profile`,
        profileForm,
        getAuthHeaders()
      );

      saveUser(res.data);

      if (avatarFile) {
        await uploadAvatar();
      }

      setAvatarFile(null);
      setProfileEdit(false);
    } catch (error) {
      alert(error.response?.data?.message || "Profile update failed");
    }
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      category: "Personal",
      priority: "Medium",
      status: "Pending",
      dueDate: ""
    });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim()) {
      alert("Task title is required");
      return;
    }

    try {
      const payload = {
        ...form,
        dueDate: form.dueDate || null
      };

      if (editingId) {
        await axios.put(
          `${API_BASE}/todos/${editingId}`,
          payload,
          getAuthHeaders()
        );
      } else {
        await axios.post(`${API_BASE}/todos`, payload, getAuthHeaders());
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
      dueDate: todo.dueDate ? todo.dueDate.slice(0, 10) : ""
    });
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this task?")) return;

    try {
      await axios.delete(`${API_BASE}/todos/${id}`, getAuthHeaders());
      fetchTodos();
    } catch (error) {
      alert(error.response?.data?.message || "Delete failed");
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
    (todo) => todo.status === "Completed"
  ).length;

  if (!user) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-logo">
            <Rocket size={32} />
          </div>

          <h1>TaskVerse</h1>

          <p className="auth-subtitle">
            {authMode === "login"
              ? "Login to manage your private tasks"
              : "Create an account to start managing tasks"}
          </p>

          <form onSubmit={handleAuthSubmit}>
            {authMode === "register" && (
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={authForm.name}
                onChange={handleAuthChange}
                required
              />
            )}

            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={authForm.email}
              onChange={handleAuthChange}
              required
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={authForm.password}
              onChange={handleAuthChange}
              required
            />

            <button type="submit" className="submit-btn">
              {authMode === "login" ? "Login" : "Create Account"}
            </button>
          </form>

          <button
            className="switch-auth"
            type="button"
            onClick={() =>
              setAuthMode(authMode === "login" ? "register" : "login")
            }
          >
            {authMode === "login"
              ? "New user? Create account"
              : "Already have an account? Login"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <nav className="navbar">
        <div className="brand">
          <div className="brand-logo">
            <Rocket size={28} />
          </div>

          <div>
            <h2>TaskVerse</h2>
            <p>Welcome, {user.name}</p>
          </div>
        </div>

        <div className="profile-area">
          <button
            className="profile-btn"
            type="button"
            onClick={() => setProfileOpen(!profileOpen)}
          >
            <img src={getAvatar()} alt="profile" />
            <span>{user.name}</span>
          </button>

          {profileOpen && (
            <div className="profile-menu">
              <img className="profile-menu-img" src={getAvatar()} alt="profile" />

              <h3>{user.name}</h3>
              <p>{user.email}</p>
              <small>{user.about || "MERN Stack Learner"}</small>

              <button type="button" onClick={openProfileEdit}>
                Edit Profile
              </button>

              <button type="button" className="logout-menu-btn" onClick={logout}>
                Logout
              </button>
            </div>
          )}
        </div>
      </nav>

      <section className="hero">
        <div className="hero-glass">
          <span className="hero-badge">
            <Sparkles size={16} /> Private Todo Dashboard
          </span>

          <h1>Your Tasks. Your Account. Your Control.</h1>

          <p>
            Manage your own private todos securely. Only you can view, edit, and
            delete the tasks created by your account.
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
            <p>Your task will be saved privately under your account.</p>
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
              <p>Only your private tasks are visible here.</p>
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
            {filteredTodos.length === 0 ? (
              <div className="empty-box">
                <h3>No tasks found</h3>
                <p>Create your first private task now.</p>
              </div>
            ) : (
              filteredTodos.map((todo) => (
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
            )}
          </div>
        </section>
      </main>

      {profileEdit && (
        <div className="modal-overlay">
          <form className="profile-modal" onSubmit={handleProfileUpdate}>
            <h2>Edit Profile</h2>

            <label>Name</label>
            <input
              type="text"
              name="name"
              value={profileForm.name}
              onChange={handleProfileChange}
              placeholder="Your name"
            />

            <label>Profile Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setAvatarFile(e.target.files[0])}
            />

            <label>About</label>
            <textarea
              name="about"
              value={profileForm.about}
              onChange={handleProfileChange}
              placeholder="Write something about you"
            />

            <button className="submit-btn" type="submit">
              Save Profile
            </button>

            <button
              className="cancel-btn"
              type="button"
              onClick={() => setProfileEdit(false)}
            >
              Cancel
            </button>
          </form>
        </div>
      )}

      <footer className="footer">
        <div className="footer-brand">
          <div className="brand-logo">
            <Rocket size={28} />
          </div>

          <h2>TaskVerse</h2>
        </div>

        <p>
          Developed by <strong>Jeet Mondal</strong> | Secure MERN Todo Website
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