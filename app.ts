import express, { Request, Response } from "express";
import "dotenv/config";
// import userRouter from "./routes/user.ts"
const app = express();
app.use(express.json());
// app.use("/api/v1/createUsers",userRouter);
export default app;
