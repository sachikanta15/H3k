import { Router } from "express";
import {
  root,
  signup,
  login,
  deleteUser,
  createProject,
  rateProjectAndEmployees,
  projects,
  getProject,
  allProjects,
  getManagersWithProjectDetails,
  getEmployeesWithProjectDetails,
  getEmployeeDetails,
} from "../controllers/user";
import {
  authMiddleware,
  isAmin,
  isManager,
} from "../middleware/authMiddleware";
const router = Router();
router.get("/", root), router.post("/signup", signup);
router.post("/login", login);

router.delete("delete/:id", authMiddleware, isManager, deleteUser);

router.post("/project", authMiddleware, isManager, createProject); // creating projects

router.get("/projects", authMiddleware, projects); //get ll the projects without other detaisl only project details

router.get("/project/:projectId", authMiddleware, isManager, getProject); // manager can see all the deatils along with all the users associate with it.

router.post(
  "/project/:id/rate",
  authMiddleware,
  isManager,
  rateProjectAndEmployees
);

router.get("/globalProjects", allProjects);
router.get(
  "/getManagersWithProjectDetails",
  authMiddleware,
  isAmin,
  getManagersWithProjectDetails
);

router.get(
  "/getEmployeesWithProjectDetails",
  authMiddleware,
  isAmin,
  getEmployeesWithProjectDetails
);

router.get("/getUserDetails/:id", authMiddleware, getEmployeeDetails);

export default router;
