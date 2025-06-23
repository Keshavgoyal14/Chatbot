import { Request, Response, NextFunction } from "express";
import User from "../models/users";

// Extend Express Request interface to include 'user'
declare global {
  namespace Express {
    interface Request {
      user?: typeof User.prototype;
    }
  }
}

export const checkPlanExpiry = async (req: Request, res: Response, next: NextFunction) => {
  const userId = res.locals.jwtData.id;
  const user = await User.findById(userId);
  if (!user) { res.status(404).json({ message: "User not found" });return }

  if (user.plan !== "free" && user.planExpiresAt && user.planExpiresAt < new Date()) {
    user.plan = "free";
    user.planActivatedAt = undefined;
    user.planExpiresAt = undefined;
    await user.save();
  }
  // Attach user to request for downstream use
  req.user = user;
  next();
};