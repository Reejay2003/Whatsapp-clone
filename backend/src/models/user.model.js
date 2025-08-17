import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true,
    },
    name:{
        type:String,
        required:true, 
    },
    name:{
        type:String,
        default:"", 
    },profilePic: {
        type: String,
        default: "",
      },
},{timestamps:true} );

export default mongoose.model("User",userSchema); 