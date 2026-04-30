import mongoose from "mongoose";

const todoSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
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

export default mongoose.model("Todo", todoSchema);