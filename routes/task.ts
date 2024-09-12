import { Router } from "express";
import {
  root,
  changeTaskStatus,
  createTask,
  deleteTask,
  reviewTask,
  submitTask,
} from "../controllers/task";

const router = Router();
router.get('/',root);
router.post("/createTask", createTask);
router.post("/submitTask", submitTask);
router.post("reviewTask", reviewTask);
router.put("/changeTaskStatus", changeTaskStatus);
router.delete("/deleteTask", deleteTask);
export default router;