import { Router } from "express";
import {
  root,
  signup,
  login,
  deleteUser,
  createProject,
  getProjects,
} from "../controllers/user";
import authMiddleware from "../middleware/authMiddleware";
const router = Router();
router.get("/", root), router.post("/signup", signup);
router.post("/login", login);
router.delete("delete/:id", deleteUser);
router.post("/project", createProject);
router.get("/project", authMiddleware, getProjects);
export default router;
