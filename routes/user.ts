import { Router } from "express";
import { root, signup, login, deleteUser, createProject } from "../controllers/user";
const router = Router();
router.get("/", root), 
router.post("/signup", signup);
router.post("/login", login);
router.delete("delete/:id", deleteUser);
router.post("/project",createProject);
export default router;
