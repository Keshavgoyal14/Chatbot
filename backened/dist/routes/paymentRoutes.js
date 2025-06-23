"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const payment_1 = require("../controllers/payment");
const token_manger_1 = require("../utils/token-manger");
const paymentsRoutes = (0, express_1.Router)();
paymentsRoutes.post("/create-order", token_manger_1.verifytoken, payment_1.createOrder);
paymentsRoutes.post("/verify-payment", token_manger_1.verifytoken, payment_1.verifyPayment);
exports.default = paymentsRoutes;
