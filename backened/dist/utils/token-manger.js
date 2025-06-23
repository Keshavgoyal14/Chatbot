"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifytoken = exports.createtoken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const createtoken = (id, email, expires) => {
    const Jwt_secret = process.env.JWT_SECRET;
    if (!Jwt_secret) {
        throw new Error("JWT_SECRET environment variable is not defined");
    }
    const payload = { id, email };
    const options = {
        expiresIn: expires,
    };
    const token = jsonwebtoken_1.default.sign(payload, Jwt_secret, options);
    return token;
};
exports.createtoken = createtoken;
const verifytoken = (req, res, next) => {
    const Jwt_secret = process.env.JWT_SECRET;
    const token = req.signedCookies['auth-token'];
    if (!Jwt_secret) {
        res.status(500).json({ message: "JWT_SECRET environment variable is not defined" });
        return;
    }
    if (!token) {
        res.status(401).json({ message: "token not found" });
        return;
    }
    return new Promise((resolve, reject) => {
        return jsonwebtoken_1.default.verify(token, Jwt_secret, (err, success) => {
            if (err) {
                reject(err);
                res.status(401).json({ success: false, message: "Unauthorized acess" });
            }
            else {
                console.log("Token verified successfully");
                resolve();
                res.locals.jwtData = success;
                next();
            }
        });
    });
};
exports.verifytoken = verifytoken;
