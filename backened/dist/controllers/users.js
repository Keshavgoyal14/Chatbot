"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentUser = exports.userlogout = exports.userVerify = exports.userlogin = exports.usersignup = exports.getAllusers = void 0;
const users_1 = __importDefault(require("../models/users"));
const bcrypt_1 = require("bcrypt");
const token_manger_1 = require("../utils/token-manger");
const getAllusers = async (req, res, next) => {
    try {
        const users = await users_1.default.find();
        res.status(200).json({ success: true, users });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};
exports.getAllusers = getAllusers;
const usersignup = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;
        const existingUser = await users_1.default.findOne({ email });
        if (existingUser) {
            res.status(400).json({ success: false, message: "Email already registered" });
            return;
        }
        const hashedPassword = await (0, bcrypt_1.hash)(password, 10);
        const user = new users_1.default({ name, email, password: hashedPassword });
        await user.save();
        res.clearCookie("auth-token", { path: "/", domain: "localhost", httpOnly: true, signed: true });
        const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
        const token = (0, token_manger_1.createtoken)(user._id.toString(), user.email, "7d");
        res.cookie("auth-token", token, { path: "/", domain: "localhost", expires, httpOnly: true, signed: true });
        res.status(200).json({ success: true, name: user.name, email: user.email });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};
exports.usersignup = usersignup;
const userlogin = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await users_1.default.findOne({ email });
        if (!user) {
            res.status(401).json({ success: false, message: "Invalid email or password" });
            return;
        }
        const isPasswordvalid = await (0, bcrypt_1.compare)(password, user.password);
        if (!isPasswordvalid) {
            res.status(401).send({ success: false, message: "Invalid email or password" });
            return;
        }
        res.clearCookie("auth-token", { path: "/", domain: "localhost", httpOnly: true, signed: true });
        const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        const token = (0, token_manger_1.createtoken)(user._id.toString(), user.email, "7d");
        res.cookie("auth-token", token, { path: "/", domain: "localhost", expires, httpOnly: true, signed: true });
        res.status(200).json({ success: true, name: user.name, email: user.email });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};
exports.userlogin = userlogin;
const userVerify = async (req, res, next) => {
    try {
        const user = await users_1.default.findById(res.locals.jwtData.id);
        if (!user) {
            res.status(401).json({ message: "User not registered" });
            return;
        }
        if (user._id.toString() !== res.locals.jwtData.id) {
            res.status(401).json({ message: "Unauthorized access" });
        }
        res.status(200).json({ success: true, name: user.name, email: user.email });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};
exports.userVerify = userVerify;
const userlogout = async (req, res, next) => {
    try {
        res.clearCookie("auth-token", { path: "/", domain: "localhost", httpOnly: true, signed: true });
        res.status(200).json({ success: true, message: "Logged out successfully" });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};
exports.userlogout = userlogout;
const getCurrentUser = async (req, res) => {
    try {
        const userId = res.locals.jwtData.id;
        const user = await users_1.default.findById(userId);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        res.json(user);
    }
    catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};
exports.getCurrentUser = getCurrentUser;
