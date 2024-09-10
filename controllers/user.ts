import { Request, Response } from "express";

export const root = async (req: Request, res: Response) => {
  console.log("printing from the root");
  res.send("Welcome to the H3k ")
};

//creating new user


