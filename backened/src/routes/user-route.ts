import { getAllusers, getCurrentUser, userlogout } from "../controllers/users";
import { Router } from "express";
import { usersignup,userlogin ,userVerify} from "../controllers/users";
import { verifytoken } from "../utils/token-manger";
import {validate,signupValidator, loginValidator} from "../utils/user-validator";
const userRoutes = Router();

userRoutes.get("/", getAllusers);
userRoutes.post("/signup",validate(signupValidator),usersignup)
userRoutes.post("/login",validate(loginValidator),userlogin)
userRoutes.get("/auth-status",verifytoken,userVerify)
userRoutes.post("/logout",verifytoken,userlogout)
userRoutes.get("/get-current-user", verifytoken, getCurrentUser);
export default userRoutes;