import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(" ")[1]; // Bearer token

  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
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

export default authMiddleware;
