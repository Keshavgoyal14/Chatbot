import razorpay from "../configration/RazorpayConfig";
import { Request, Response, NextFunction } from "express";
import User from "../models/users";
import crypto from "crypto";
export  const createOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {amount }=req.body;
        if (!amount ) {
            res.status(400).json({ success: false, message: "Amount and currency are required" })
            return;
        }
        const options ={
            amount :amount *100,
            currency: "INR",
            receipt: "receipt#1"+ Date.now(),

        }
        const order = await razorpay.orders.create(options);
        res.status(200).json({ success: true, order });
    } catch (error) {
        console.error("error in payments",error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
        
    }
}
export const verifyPayment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {orderId,paymentId,amount,plan,signature}= req.body;
        if (!orderId || !paymentId || !amount || !plan) {
            res.status(400).json({ success: false, message: "Order ID, Payment ID, amount and plan are required" });
            return;
        }
        const userId = res.locals.jwtData.id;
        if (!userId) {
            res.status(401).json({ success: false, message: "Unauthorized" });
            return;
        }
        const generatedSignature = crypto
  .createHmac("sha256", process.env.RAZORPAY_SECRET_KEY as string)
  .update(orderId + "|" + paymentId)
  .digest("hex");

if (generatedSignature !== signature) {
  res.status(400).json({ success: false, message: "Invalid payment signature" });
return}
        const user = await User.findById(userId);
        if (!user) {
            res.status(404).json({ success: false, message: "User not found" });
            return;
        }
        user.payments.push({
            orderId,plan,amount,currency:"INR",paymentId
        })
        if (plan === "pro") {
            user.plan = "pro";
            user.planActivatedAt = new Date();
            user.planExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
        } else if (plan === "enterprise") {
            user.plan = "enterprise";
            user.planActivatedAt = new Date();
            user.planExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 1 year
        }
        await user.save();
    } catch (error) {
        console.error("error in verifying payment", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
        
    }
}