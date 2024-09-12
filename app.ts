import express, { Request, Response } from "express";
import "dotenv/config";
import userRoutes from "./routes/user";
import taskRoutes from "./routes/task";
const app = express();
app.use(express.json());

app.use("/user", userRoutes);
app.use("/task", taskRoutes);
export default app;
