import mongoose from "mongoose";

const todoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      default: ""
    },
    category: {
      type: String,
      default: "Personal"
    },
    priority: {
      type: String,
      default: "Medium"
    },
    status: {
      type: String,
      default: "Pending"
    },
    dueDate: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

const Todo = mongoose.model("Todo", todoSchema);

export default Todo;