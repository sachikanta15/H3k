import { Router } from "express";
import {
  root,
  signup,
  login,
  deleteUser,
  resetPassword,
} from "../controllers/user";
const router = Router();
router.get("/", root), router.post("/signup", signup);
router.post("/login", login);
router.delete("accountDelete/:id", deleteUser);
router.post("/resetPassword", resetPassword);
