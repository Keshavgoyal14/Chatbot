"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyPayment = exports.createOrder = void 0;
const RazorpayConfig_1 = __importDefault(require("../configration/RazorpayConfig"));
const users_1 = __importDefault(require("../models/users"));
const crypto_1 = __importDefault(require("crypto"));
const createOrder = async (req, res, next) => {
    try {
        const { amount } = req.body;
        if (!amount) {
            res.status(400).json({ success: false, message: "Amount and currency are required" });
            return;
        }
        const options = {
            amount: amount * 100,
            currency: "INR",
            receipt: "receipt#1" + Date.now(),
        };
        const order = await RazorpayConfig_1.default.orders.create(options);
        res.status(200).json({ success: true, order });
    }
    catch (error) {
        console.error("error in payments", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};
exports.createOrder = createOrder;
const verifyPayment = async (req, res, next) => {
    try {
        const { orderId, paymentId, amount, plan, signature } = req.body;
        if (!orderId || !paymentId || !amount || !plan) {
            res.status(400).json({ success: false, message: "Order ID, Payment ID, amount and plan are required" });
            return;
        }
        const userId = res.locals.jwtData.id;
        if (!userId) {
            res.status(401).json({ success: false, message: "Unauthorized" });
            return;
        }
        const generatedSignature = crypto_1.default
            .createHmac("sha256", process.env.RAZORPAY_SECRET_KEY)
            .update(orderId + "|" + paymentId)
            .digest("hex");
        if (generatedSignature !== signature) {
            res.status(400).json({ success: false, message: "Invalid payment signature" });
            return;
        }
        const user = await users_1.default.findById(userId);
        if (!user) {
            res.status(404).json({ success: false, message: "User not found" });
            return;
        }
        user.payments.push({
            orderId, plan, amount, currency: "INR", paymentId
        });
        if (plan === "pro") {
            user.plan = "pro";
            user.planActivatedAt = new Date();
            user.planExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
        }
        else if (plan === "enterprise") {
            user.plan = "enterprise";
            user.planActivatedAt = new Date();
            user.planExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 1 year
        }
        await user.save();
    }
    catch (error) {
        console.error("error in verifying payment", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};
exports.verifyPayment = verifyPayment;
