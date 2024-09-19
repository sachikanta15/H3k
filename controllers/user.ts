import { Request, Response } from "express";
import { Prisma, PrismaClient } from "@prisma/client";
import { z } from "zod";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import "dotenv/config";

const prisma = new PrismaClient();

export const root = async (_req: Request, res: Response) => {
  console.log("printing from the root");
  res.send("Welcome to the H3k ");
};

//Defineing the Zod schema for user validation while runtime

//API endpoinst creating new user
export const signup = async (req: Request, res: Response) => {
  try {
    const userSchema = z.object({
      name: z.string().min(1, "Name is Required"),
      email: z.string().email("Invalid email address"),
      designation: z.string(),
      password: z.string().min(6),
      role: z.enum(["ADMIN", "MANAGER", "EMPLOYEE"]),
    });
    //validate userinpuut from zod
    const validaetData = userSchema.parse(req.body);

    //check for valid invation

    //check for existing  user
    const existingUser = await prisma.user.findUnique({
      where: {
        email: validaetData.email,
      },
    });

    if (existingUser) {
      return res.status(400).json({
        error: "User with this Email already exist",
      });
    }

    //create a new user in db

    const newUser = await prisma.user.create({
      data: {
        name: validaetData.name,
        email: validaetData.email,
        password: await bcrypt.hash(validaetData.password, 10),
        designation: validaetData.designation,
      },
    });

    res.status(201).json(`User ${newUser.name} created successfully `);
  } catch (error) {
    //if zod error validation error
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        erros: error.errors,
      });
    }
    //handle other errors
    res.status(500).json({
      error: "Internal Server Error",
    });
  }
};

export const login = async (req: Request, res: Response) => {
  const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
  });

  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
        password: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
      expiresIn: "1h",
    });

    // Send the token back to the client
    res.json({
      message: "Login successful",
      id: user.id,
      token,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Handle validation errors
      return res.status(400).json({ error: error.errors });
    }
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  console.log("printing the id");
  console.log(id);
  try {
    const deleteUserSchema = z.object({
      userId: z.string(),
    });
    const validaetData = deleteUserSchema.parse(id);
    const deleteUser = await prisma.user.delete({
      where: {
        id: validaetData.userId,
      },
    });
    if (!deleteUser) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const createProject = async (req: Request, res: Response) => {
  const { userId } = req.params;
  console.log("printing the userId");
  console.log(userId);
  try {
    // Extract userId from the request parameters

    // Find the user from the database using the userId
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }, // Only fetch the role of the user
    });

    // Check if the user exists and if the role is 'Manager'
    if (!user || user.role !== "MANAGER") {
      return res.status(403).json({
        error: "Access denied. Only Managers can create projects.",
      });
    }

    // Define schema for project data validation
    const projectSchema = z.object({
      name: z.string().min(1, "Project Name is Required"),
      startingDate: z.string().date(),
      endDate: z.string().date(),
    });

    // Validate the request body against the schema
    const validatedData = projectSchema.parse(req.body);
    console.log("printing the validate data");
    console.log(validatedData);

    // Check if a project with the same name already exists

    const existingProject = await prisma.projects.findUnique({
      //@ts-ignore
      where: {
        name: validatedData.name,
      },
    });

    if (existingProject) {
      return res.status(400).json({
        error: "Project already exists",
      });
    }

    // Create a new project in the database
    const newProject = await prisma.projects.create({
      data: {
        name: validatedData.name,
        startingDate: validatedData.startingDate,
        endDate: validatedData.endDate,
      },
    });

    // Return a success response
    res.status(201).json(`${newProject.name} Project created successfully`);
  } catch (error) {
    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        errors: error.errors,
      });
    }

    // Handle other errors (e.g., server issues)
    res.status(500).json({
      error: "Internal Server Error",
    });
  }
};
