import { Router } from "express";
import { root, signup, login } from "../controllers/user";
const router = Router();
router.get("/", root), 
router.post("/signup", signup);
router.post("/login", login);
