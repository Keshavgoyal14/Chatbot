import User from '../models/users';
import { hash, compare } from "bcrypt";
import { createtoken } from '../utils/token-manger';
import { Request, Response, NextFunction } from 'express';
export const getAllusers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const users = await User.find();
        res.status(200).json({ success: true, users })
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Internal Server Error" })
    }
}
export const usersignup = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, email, password } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            res.status(400).json({ success: false, message: "Email already registered" });
            return;
        }
        const hashedPassword = await hash(password, 10);
        const user = new User({ name, email, password: hashedPassword });
        await user.save();
        const cookieDomain = process.env.COOKIE_DOMAIN || "localhost";
         res.clearCookie("auth-token", { path: "/", httpOnly: true, signed: true ,sameSite: "none", secure: true });
         const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
            const token = createtoken(user._id.toString(), user.email, "7d");
            res.cookie("auth-token",token, { path: "/",  expires, httpOnly: true, signed: true ,sameSite: "none", secure: true })

        res.status(200).json({ success: true, name:user.name,email:user.email })
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Internal Server Error" })

    }
}
export const userlogin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            res.status(401).json({ success: false, message: "Invalid email or password" });
            return
        }
        const isPasswordvalid = await compare(password, user.password);
        if (!isPasswordvalid) {
         res.status(401).send({ success: false, message: "Invalid email or password" });
         return;
        }
        const cookieDomain = process.env.COOKIE_DOMAIN || "localhost";
        res.clearCookie("auth-token", { path: "/", httpOnly: true, signed: true,sameSite :"none", secure:true });
         const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); 
            const token = createtoken(user._id.toString(), user.email, "7d");
            res.cookie("auth-token",token, { path: "/", expires, httpOnly: true, signed: true,sameSite:"none", secure:true })

        res.status(200).json({ success: true,name:user.name,email:user.email  })
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Internal Server Error" })

    }

}
export const userVerify = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await User.findById(res.locals.jwtData.id);
        if (!user) {
            res.status(401).json({ message: "User not registered" });
            return
        }
        if (user._id.toString() !== res.locals.jwtData.id) {
             res.status(401).json({ message: "Unauthorized access" })
        }
        res.status(200).json({ success: true,name:user.name,email:user.email  })
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Internal Server Error" })

    }

}
export const userlogout = async (req: Request, res: Response, next: NextFunction) => {
    try {
          const cookieDomain = process.env.COOKIE_DOMAIN || "localhost";
        res.clearCookie("auth-token", { path: "/",  httpOnly: true, signed: true,sameSite: "none", secure: true });
        res.status(200).json({ success: true, message: "Logged out successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};
export const getCurrentUser = async (req: Request, res: Response) => {
    try {
        const userId = res.locals.jwtData.id;
        const user = await User.findById(userId);
        if (!user) { res.status(404).json({ message: "User not found" });return}
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};