import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import path from "path";
import { fileURLToPath } from "url";

import connectDB from "./config/db.js";
import todoRoutes from "./routes/todoRoutes.js";

dotenv.config();

const app = express();

connectDB();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

app.use(morgan("dev"));
app.use(express.json());

app.use(
  cors({
    origin: process.env.CLIENT_URL || "*",
    credentials: true,
  })
);

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
  })
);

app.use("/api/todos", todoRoutes);

const frontendPath = path.join(__dirname, "../frontend/dist");

app.use(express.static(frontendPath));

app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});




app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});