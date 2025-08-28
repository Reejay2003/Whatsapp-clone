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
    e2ePublicKey: { type: Object, default: null },
    e2eKeyBackup: { type: Object, default: null }, // will store {v,kdf,iters,salt,iv,ct}
},{timestamps:true} );

export default mongoose.model("User",userSchema); 