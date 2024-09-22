import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { Prisma, PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log("printing from the authMiddleware");
  const token = req.headers.authorization?.split(" ")[1]; // Bearer token

  if (!token) {
    return res.status(401).json({ error: "Access denied. from " });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    console.log("Decoded vlue");
    console.log(decoded);
    //@ts-ignore
    req.user = decoded.userId; // Attach decoded token (user) to the request object
    const userDetails = await prisma.user.findUnique({
      where: {
        //@ts-ignore
        id: decoded.userId,
      },
    });
    //@ts-ignore
    req.role = userDetails?.role;

    next();
  } catch (err) {
    return res.status(400).json({ error: "Invalid token." });
  }
};

export const isManager = (req: Request, res: Response, next: NextFunction) => {
  console.log("printing from the isManager");
  
  

  //@ts-ignore
  if (req.role !== "MANAGER") {
    return res.status(403).json({ error: "Access denied" });
  }
  next();
};


export const isAmin = (req: Request, res: Response, next: NextFunction) => {
  console.log("printing from the isAdmin");


  //@ts-ignore
  if (req.role !== "ADMIN") {
    return res.status(403).json({ error: "Access denied" });
  }
  
  next();
};
