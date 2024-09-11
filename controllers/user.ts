import { Request, Response } from "express";
import { Prisma, PrismaClient } from "@prisma/client";
import { z } from "zod";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import "dotenv/config";
import nodemailer from "nodemailer";

const prisma = new PrismaClient();

export const root = async (req: Request, res: Response) => {
  console.log("printing from the root");
  res.send("Welcome to the H3k ");
};

//Defineing the Zod schema for user validation while runtime

export const inviteUser = async (req: Request, res: Response) => {
  try {
    const inviteUserSchema = z.object({
      email: z.string().email(),
      role: z.enum(["VP", "MANAGER", "EMPLOYEE"]),
      designation: z.string(),
    });

    const validatedData = inviteUserSchema.parse(req.body);
    const { email } = validatedData;
    const existingUser = await prisma.user.findUnique({
      where: {
        email: validatedData.email,
      },
    });
    if (existingUser) {
      return res
        .status(400)
        .json({ error: "User with this Email already exists" });
    }

    const invitation = await prisma.invitation.create({
      data: {
        email: validatedData.email,
        role: validatedData.role,
      },
    });

    //Genearte token
    //@ts-ignore
    const token = jwt.sign({ email }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });
    //creating signup link
    const signupLink = `${process.env.CLIENT_URL}/signup?token=${token}`;

    //send email to user
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: validatedData.email,
      subject: "You are invited to sign up",
      text: `Please use the following link to sign up: ${signupLink}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return res.status(500).json({ error: "Failed to send email" });
      }
      res.status(200).json({
        message: `Invitation sent successfully to ${validatedData.email}`,
      });
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    res.status(500).json({ error: "Internal Server Error" });
  }
};

//API endpoinst creating new user
export const signup = async (req: Request, res: Response) => {
  try {
    const userSchema = z.object({
      name: z.string().min(1, "Name is Required"),
      email: z.string().email("Invalid email address"),
      password: z.string().min(6),
    });
    //valodate userinpuut from zod
    const validaetData = userSchema.parse(req.body);

    //check for valid invation
    const invitation = await prisma.invitation.findFirst({
      where: {
        email: validaetData.email,
      },
    });

    if (!invitation) {
      return res.status(400).json({ error: "Invalid or expired invitation" });
    }

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
        role: invitation.role,
        designation: invitation.designation,
      },
    });

    await prisma.invitation.delete({
      where: {
        email: validaetData.email,
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

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET!,
      {
        expiresIn: "1h",
      }
    );

    // Send the token back to the client
    res.json({ message: "Login successful", token });
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
  try {
    const deleteUserSchema = z.object({
      userId: z.string(),
    });
    const validaetData = deleteUserSchema.parse(req.params.id);
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
