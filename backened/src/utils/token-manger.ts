import jwt, { SignOptions } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

export const createtoken=(id:string,email:string,expires:string)=>{
    const Jwt_secret=process.env.JWT_SECRET
    if (!Jwt_secret) {
        throw new Error("JWT_SECRET environment variable is not defined")
    }
 const payload ={id,email};
 const options: SignOptions = {
    expiresIn: expires as SignOptions['expiresIn'], 
  };
 const token= jwt.sign(payload,Jwt_secret, options);
 return token;
}

export const verifytoken=(req:Request, res:Response, next:NextFunction)=>{
  const Jwt_secret=process.env.JWT_SECRET;
   const token =req.signedCookies['auth-token'] ;
    if (!Jwt_secret) {
    res.status(500).json({ message: "JWT_SECRET environment variable is not defined" });
    return;
  }
   if (!token ){
   res.status(401).json({message:"token not found"})
    return;
   }
 return new Promise<void>((resolve, reject) => {
  return jwt.verify(token,Jwt_secret,(err: jwt.VerifyErrors | null, success: object | string | undefined)=>{
    if(err){
      reject(err)
      res.status(401).json({success:false,message:"Unauthorized acess"})
    }
    else{
     console.log("Token verified successfully");
      resolve();
      res.locals.jwtData=success
      next();
    }
  })
 }
)

}