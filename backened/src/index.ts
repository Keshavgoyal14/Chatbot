import app from "./app"
import {connectDB} from "./DB/connection";
const PORT = process.env.PORT || 5000;
connectDB().then(()=>{
app.listen(PORT,()=>{console.log(`Server started on port ${PORT} and Database connected`)})
}).catch((error)=>{
    console.error("Error connecting to the database:", error)
})
