import { Router } from "express";
import {
  root,
  signup,
  login,
  deleteUser,
  createProject,
  getProjects,
  rateProjectAndEmployees,
  projects,
} from "../controllers/user";
import { authMiddleware, isManager } from "../middleware/authMiddleware";
const router = Router();
router.get("/", root), router.post("/signup", signup);
router.post("/login", login);
router.delete("delete/:id", authMiddleware, isManager, deleteUser);
router.post("/project", authMiddleware, isManager, createProject);
router.get("/project", authMiddleware, projects);

router.post(
  "/projects/:id/rate",
  authMiddleware,
  isManager,
  rateProjectAndEmployees
);

export default router;
