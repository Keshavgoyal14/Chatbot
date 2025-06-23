"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkPlanExpiry = void 0;
const users_1 = __importDefault(require("../models/users"));
const checkPlanExpiry = async (req, res, next) => {
    const userId = res.locals.jwtData.id;
    const user = await users_1.default.findById(userId);
    if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
    }
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
exports.checkPlanExpiry = checkPlanExpiry;
