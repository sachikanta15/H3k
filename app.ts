import express, { Request, Response } from "express";
import "dotenv/config";
import userRoutes from "./routes/user";
import cors from "cors"

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use("/user", userRoutes);

export default app;
