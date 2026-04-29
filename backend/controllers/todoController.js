import Todo from "../models/Todo.js";

export const getTodos = async (req, res) => {
  try {
    const todos = await Todo.find().sort({ createdAt: -1 });
    res.status(200).json(todos);
  } catch (error) {
    console.log("GET ERROR:", error.message);
    res.status(500).json({ message: error.message });
  }
};

export const createTodo = async (req, res) => {
  try {
    console.log("BODY RECEIVED:", req.body);

    const { title, description, category, priority, status, dueDate } = req.body;

    if (!title || title.trim() === "") {
      return res.status(400).json({ message: "Title is required" });
    }

    const todo = await Todo.create({
      title,
      description: description || "",
      category: category || "Personal",
      priority: priority || "Medium",
      status: status || "Pending",
      dueDate: dueDate || null
    });

    res.status(201).json(todo);
  } catch (error) {
    console.log("CREATE ERROR:", error.message);
    res.status(500).json({ message: error.message });
  }
};

export const updateTodo = async (req, res) => {
  try {
    const data = {
      ...req.body,
      dueDate: req.body.dueDate || null
    };

    const todo = await Todo.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true
    });

    if (!todo) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.status(200).json(todo);
  } catch (error) {
    console.log("UPDATE ERROR:", error.message);
    res.status(500).json({ message: error.message });
  }
};

export const deleteTodo = async (req, res) => {
  try {
    const todo = await Todo.findByIdAndDelete(req.params.id);

    if (!todo) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    console.log("DELETE ERROR:", error.message);
    res.status(500).json({ message: error.message });
  }
};