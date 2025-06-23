"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_route_1 = __importDefault(require("./user-route"));
const chat_route_1 = __importDefault(require("./chat-route"));
const chatpdf_routes_1 = __importDefault(require("./chatpdf-routes"));
const chataudio_routes_1 = __importDefault(require("./chataudio-routes"));
const paymentRoutes_1 = __importDefault(require("./paymentRoutes"));
const approuter = (0, express_1.Router)();
approuter.use("/user", user_route_1.default);
approuter.use("/chat", chat_route_1.default);
approuter.use("/chat-pdf", chatpdf_routes_1.default);
approuter.use("/chat-audio", chataudio_routes_1.default);
approuter.use("/payments", paymentRoutes_1.default);
exports.default = approuter;
