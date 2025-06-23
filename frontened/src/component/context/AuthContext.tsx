import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
type User ={
    name:string,
    email:string
}
type AuthUser={
    isloggedIn:boolean,
    user:User | null,
    login:(email:string,password:string)=>Promise<void>,
    signup:(name:string,email:string,password:string)=>Promise<void>,

    logout:()=>Promise<void>,
    authLoading:boolean
}

export const AuthContext = createContext<AuthUser | null>(null)

export const AuthProvider =({ children }: { children: React.ReactNode }) => {
const [authLoading, setAuthLoading] = useState<boolean>(true);
    const [user,setUser]=useState<User | null>(null);
    const [isloggedIn, setIsLoggedIn] = useState<boolean>(false);
 useEffect(()=>{
        const checkAuthStatus = async () => {
            try {
                const res = await axios.get('/user/auth-status',{withCredentials:true});
                if (res.data.success) {
                    setUser({ name: res.data.name, email: res.data.email });
                    setIsLoggedIn(true);
                } else {
                    setUser(null);
                    setIsLoggedIn(false);
                }
            } catch (error) {
                console.error("Error checking auth status:", error);
                setUser(null);
                setIsLoggedIn(false);
            }finally{
                setAuthLoading(false);
            }
        };
        checkAuthStatus();
    },[])
    const login =async(email:string,password:string)=>{
const res = await axios.post('user/login',{email,password})
        if(res.data.success){
             console.log("Login successful", res.data);
            setUser({name:res.data.name,email:res.data.email})
            setIsLoggedIn(true)
        }else{
            throw new Error(res.data.message || "Login failed")
        }

    }
    const logout =async()=>{
        await axios.post('/user/logout',{withCredentials:true});
        toast.success("Logged out successfully");
        setUser(null)
        setIsLoggedIn(false);
    }
    const signup=async(name:string,email:string,password:string)=>{
        const res = await axios.post('/user/signup',{name,email,password})
        if(res.data.success){
            console.log("Signup successful", res.data);
            setUser({name:res.data.name,email:res.data.email})
        }else{
            throw new Error(res.data.message || "Signup failed")
        }
    }

   
    return (
        <AuthContext.Provider value={{isloggedIn,login,logout,signup,user, authLoading}}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth=()=>useContext(AuthContext)