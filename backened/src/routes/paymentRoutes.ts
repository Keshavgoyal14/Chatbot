import { Router } from "express";
import { createOrder, verifyPayment } from "../controllers/payment";
import { verifytoken } from "../utils/token-manger";
const paymentsRoutes = Router();

paymentsRoutes.post("/create-order",verifytoken,createOrder)
paymentsRoutes.post("/verify-payment", verifytoken, verifyPayment);

export default paymentsRoutes;