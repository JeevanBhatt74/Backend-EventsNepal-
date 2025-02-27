import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JwtPayload } from "../types";
import { UserModel } from "../models/user";

const userModel = new UserModel();

export const authenticateJWT = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "Authorization header missing" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, "some secret key") as JwtPayload;
    const user = await userModel.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    // @ts-ignore
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ error: "Invalid or expired token" });
  }
};

export const authorizeRole = (roles: ("user" | "admin")[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // @ts-ignore
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Unauthorized access" });
    }
    next();
  };
};
