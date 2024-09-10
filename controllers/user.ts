import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
const primsa = new PrismaClient();

export const root = async (req: Request, res: Response) => {
  console.log("printing from the root");
  res.send("Welcome to the H3k ");
};

//Defineing the Zod schema for user validation while runtime
const userSchema = z.object({
  name: z.string().min(1, "Name is Required"),
  email: z.string().email("Invalid email address"),
  role: z.enum(["VP", "MANAGER", "EMPLOYEE"]),
  vpId: z.number().optional(),
  managerId: z.number().optional(),
});

//API endpoinst creating new user
export const signup = async (req: Request, res: Response) => {
  try {
    //valodate userinpuut from zod
    const validaetData = userSchema.parse(req.body);

    //check for existing  user
    const existingUser = await primsa.user.findUnique({
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

    const newUser = await primsa.user.create({
      data: validaetData,
    });
    res.status(201).json(`${newUser} added`);
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
