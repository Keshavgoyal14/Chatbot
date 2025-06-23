import { Schema } from "mongoose";
import moongoose from "mongoose";
import {randomUUID} from "crypto"

const paymentSchema=new Schema({
  orderId:{
    type:String,
    required:true,
  },
  amount:{
    type:Number,
    required:true,
  },
  currency:{
    type:String,
    default:"INR",
  },
  paymentId:{
    type:String,
    required:true,
  },
  plan:{
    type:String,
    required:true,
  },
  createdAt:{
    type:Date,
    default:Date.now,
  }
})

const pdfChatSchema = new Schema({
  role:String,
  content:String,
  id:{
    type:String,
    default:randomUUID
  }
})

const pdfSchema = new Schema({
  pdfId:{
    type:String,
    default:randomUUID
  },
  orignalFilename:{
    type:String,
    required:true
  },
  uploadDate:{
    type:Date,
    default:Date.now
  },
  pineconeNamespace:{
    type:String
  },
  summary:{
    type:String
  },
  chat_history:[pdfChatSchema]
});


const chatSchema =new Schema({
  id:{
    type:String,
    default:randomUUID
  },
  role:{
    type:String,
    required:true
  },
  content:{
    type:String,
    required:true
  }
})
const sessionSchema=new Schema({
  sessionId:{type:String,default:randomUUID},
  title:{
    type:String,
  },
  messages:[chatSchema],
})
const userSchema= new Schema({
    name:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    chats:[sessionSchema],
    pdfs:[pdfSchema],
    payments:[paymentSchema],
     plan: {
    type: String,
    enum: ["free", "pro", "enterprise"],
    default: "free",
  },
  planActivatedAt: {
    type: Date,
  },
  planExpiresAt: {
    type: Date,
  },
})

export default moongoose.model("User",userSchema);