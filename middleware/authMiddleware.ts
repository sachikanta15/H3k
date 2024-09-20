import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  console.log("printing from the authMiddleware")
  const token = req.headers.authorization?.split(" ")[1]; // Bearer token

  if (!token) {
    return res.status(401).json({ error: "Access denied. from " });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    //@ts-ignore
    req.user = decoded; // Attach decoded token (user) to the request object
    next();
  } catch (err) {
    return res.status(400).json({ error: "Invalid token." });
  }
};

export const isManager = (req: Request, res: Response, next: NextFunction) => {
  console.log("printing from the isManager")
  //@ts-ignore
  console.log(req.body.role);
  
  //@ts-ignore
  if (req.body.role !== 'MANAGER') {
    return res.status(403).json({ error: 'Access denied' });
  }
  next();
};
