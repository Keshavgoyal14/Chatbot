import axios from 'axios';
import { toast } from "sonner";

export const handlePayments=async(plan:"pro"|"enterprise")=>{
    const amount =plan === "pro" ? 199: 999;
    const {data:user}=await axios.get("/user/get-current-user", { withCredentials: true });
    const {data:order}=await axios.post("/payments/create-order", { amount }, { withCredentials: true });
    if (!order.success) {
        toast.error("Failed to create order");
        return;
    }
const options ={
    key:import.meta.env.VITE_RAZORPAY_KEY_ID,
    amount :amount*100,
    currency: "INR",
    name:"Chat.AI",
    description:plan==="pro"?"Pro Plan":"Enterprise Plan",
    order_id:order.order.id,
    prefill:{
        name:user.name||"",
        email:user.email||"",
    },
     handler:async function (res:any) {
        await axios.post("/payments/verify-payment", {
            orderId: res.razorpay_order_id,
            paymentId: res.razorpay_payment_id,
            amount,
            plan,
            signature: res.razorpay_signature
        }, { withCredentials: true });  
        toast.success("Payment successful");
     },
    theme: {
        color: "#3399cc",
    },

}
const razorpay = new (window as any).Razorpay(options);
razorpay.open();
    
}