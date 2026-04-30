import Todo from "../models/Todo.js";

export const getTodos = async (req, res) => {
  try {
    const todos = await Todo.find({ user: req.user._id }).sort({
      createdAt: -1
    });

    res.status(200).json(todos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createTodo = async (req, res) => {
  try {
    const { title, description, category, priority, status, dueDate } = req.body;

    if (!title || title.trim() === "") {
      return res.status(400).json({ message: "Task title is required" });
    }

    const todo = await Todo.create({
      user: req.user._id,
      title,
      description: description || "",
      category: category || "Personal",
      priority: priority || "Medium",
      status: status || "Pending",
      dueDate: dueDate || null
    });

    res.status(201).json(todo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateTodo = async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);

    if (!todo) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (todo.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Not allowed to update this task"
      });
    }

    todo.title = req.body.title || todo.title;
    todo.description = req.body.description ?? todo.description;
    todo.category = req.body.category || todo.category;
    todo.priority = req.body.priority || todo.priority;
    todo.status = req.body.status || todo.status;
    todo.dueDate = req.body.dueDate || null;

    const updatedTodo = await todo.save();

    res.status(200).json(updatedTodo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteTodo = async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);

    if (!todo) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (todo.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Not allowed to delete this task"
      });
    }

    await todo.deleteOne();

    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};