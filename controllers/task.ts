import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

//defineing the task schema

//creating task api endpoints

export const root = async (req: Request, res: Response) => {
  console.log("printing from the root task");
  res.send("Welcome to the H3k from task");
};
export const createTask = async (req: Request, res: Response) => {
  const taskSchema = z.object({
    title: z.string().min(1, "Title is Required"),
    description: z.string().optional(),
    points: z.number().min(0, "Points must be a positive number").optional(),
    status: z.enum(["Pending", "In Progress", "Completed"]),
    userId: z.number().int().positive("Invalid user ID"),
  });
  try {
    //validate the request body
    const validaetData = taskSchema.parse(req.body);

    //creat a task

    const newTask = await prisma.task.create({
      //@ts-ignore
      data: validaetData,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: error.errors,
      });
    }
    //handle other errors
    res.status(500).json({
      error: "Internal Server Error",
    });
  }
};
export const submitTask = async (req: Request, res: Response) => {
  //zod schema for submit task
  const submitTaskSchema = z.object({
    taskId: z.string(),
    status: z.enum(["Pending", "In Progress", "Blocked", "Completed"]),
    userId: z.string(),
  });

  //validate scehma
  const parseData = submitTaskSchema.safeParse(req.body);

  if (!parseData.success) {
    return res.status(400).json({
      error: parseData.error.errors,
    });
  }

  const { taskId, status, userId } = parseData.data;

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (!user || user.role !== "EMPLOYEE") {
      return res
        .status(403)
        .json({ error: "only employees can submit tasks." });
    }

    const existingTask = await prisma.task.findUnique({
      where: {
        id: taskId,
      },
    });
    if (!existingTask) {
      return res.status(404).json({ error: "Task not found." });
    }
    const updateTask = await prisma.task.update({
      where: {
        id: taskId,
      },
      data: {
        status,
      },
    });

    res.json({ message: "Task submitted Succesfully.", task: updateTask });
  } catch (error) {
    console.error("Error submitting task :", error);
    res.status(500).json({ error: "Internal Server Error." });
  }

  //only allow assinn points if task is completed and if its is manager

  // if (status != "Completed") {
  //   return res
  //     .status(400)
  //     .json({ error: "Points can only be assign if the task is completed." });
  // }
};

export const reviewTask = async (req: Request, res: Response) => {
  //first check if task is complete, if complete than able to assign points to task
  const reviewTaskSchema = z.object({
    taskId: z.string(),
    points: z.number().min(0, "Points must be a positive number"),
    userId: z.string(),
    status: z.enum(["Pending", "In Progress", "Completed"]),
  });

  const parsedData = reviewTaskSchema.safeParse(req.body);
  if (!parsedData.success) {
    return res.status(400).json({ error: parsedData.error.errors });
  }

  const { taskId, points, userId, status } = parsedData.data;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.role !== "MANAGER") {
      return res
        .status(403)
        .json({ error: "Only managers can review tasks and assign points." });
    }

    const existingTask = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!existingTask) {
      return res.status(404).json({ error: "Task not found." });
    }

    //only assign task if task is completed

    let updateTask;
    if (existingTask.status === "Completed") {
      updateTask = await prisma.task.update({
        where: { id: taskId },
        data: {
          points,
          status: status || existingTask.status,
        },
      });
    } else {
      updateTask = await prisma.task.update({
        where: {
          id: taskId,
        },
        data: {
          status,
        },
      });
    }
    res.json({ message: "Task reviewed Successfully.", task: updateTask });
  } catch (error) {
    console.error("Error reviewing task:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

export const changeTaskStatus = async (req: Request, res: Response) => {
  const taskStatusSchema = z.object({
    taskId: z.string(),
    userId: z.string(),
    status: z.enum(["Pending", "Blocked", "In Progress", "Completed"]),
  });
  const parsedData = taskStatusSchema.safeParse(req.body);
  if (!parsedData.success) {
    return res.status(400).json({ error: parsedData.error.errors });
  }

  const { taskId, status, userId } = parsedData.data;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user || !["MANAGER", "EMPLOYEE"].includes(user.role)) {
      return res
        .status(403)
        .json({ error: "Only managers or employees can change task status." });
    }
    const existingTask = await prisma.task.findUnique({
      where: { id: taskId },
    });
    if (!existingTask) {
      return res.status(404).json({ error: "Task not found." });
    }
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        status,
      },
    });
    res.json({
      message: "Task status updated successfully.",
      task: updatedTask,
    });
  } catch (error) {
    console.error("Error updating task status:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

export const deleteTask = async (req: Request, res: Response) => {
  const deleteTaskSchema = z.object({
    taskId: z.string(),
    userId: z.string(),
  });

  const parsedData = deleteTaskSchema.safeParse(req.body);
  if (!parsedData.success) {
    return res.status(400).json({ error: parsedData.error.errors });
  }

  const { taskId, userId } = parsedData.data;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user || !["MANAGER", "EMPLOYEE"].includes(user.role)) {
      return res
        .status(403)
        .json({ error: "Only managers or employees can delete task ." });
    }
    const existingTask = await prisma.task.findUnique({
      where: { id: taskId },
    });
    if (!existingTask) {
      return res.status(404).json({ error: "Task not found." });
    }
    const deleteTask = await prisma.task.delete({
      where: { id: taskId },
    });
    res.json({
      message: "Task Deleted successfully.",
      task: deleteTask,
    });
  } catch (error) {
    console.error("Error in Deleting task:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};
