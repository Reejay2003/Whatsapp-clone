import express from "express";
import User from "../models/user.model.js";
import {generateJWT} from "../lib/utils.js"
import bcrypt from "bcryptjs"
import cloudinary from "../lib/cloudinary.js";
const router = express.Router();



// --- add these two controller functions ---
export const setDhPublicKey = async (req, res) => {
  try {
    const { publicJwk } = req.body;
    if (!publicJwk) return res.status(400).json({ message: "publicJwk required" });
    await User.findByIdAndUpdate(req.user._id, { e2ePublicKey: publicJwk });
    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
};

export const getDhPublicKey = async (req, res) => {
  try {
    const { id } = req.params; // userId
    const user = await User.findById(id).select("e2ePublicKey");
    return res.status(200).json({ publicJwk: user?.e2ePublicKey || null });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
};
// ------------------------------------

export const signup = async(req,res)=>{
    try{
        const {name,email,password} = req.body;
        if(password.length<7){
            return res.status(400).json({message: "Password must be atleast 6 characters"});
        }
        const user = await User.findOne({email});
        if(user){
            return res.status(400).json({message: "user already exists. Please Login!!!!", user: user});
        }

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password,salt);

        const newUser = await User.create({name,email,password:hash});

        if(newUser){
            generateJWT(newUser._id, res);
            await newUser.save();
            res.status(201).json({ message: "Signed up Successfully", user: newUser.toObject() });
        }else{
            return res.status(200).json({message: "Invalid User Data"});
        }
    }catch(err){
        return res.status(400).json({message: err.message});        
    }
}

export const login = async(req,res)=>{
    try{
        const {email,password} = req.body;
        const user = await User.findOne({email});
        if(!user){
            return res.status(400).json({message: "Invalid User"});
        }
        const isCorrectPassword = await bcrypt.compare(password,user.password);
        if(!isCorrectPassword)return res.status(400).json({message: "Invalid User"});
        else{
            generateJWT(user._id,res);
            return res.status(200).json({message: "User Loggedin Successfully", user:user.toObject()});
        }
    }catch(err){
        return res.status(400).json({message: err.message});        
    }
}

export const logout = (req,res)=>{
    try{
        res.cookie("jwt", "",{maxAge: 0});
        return res.status(200).json({message: "User Logged out Successfully"});

    }catch(err){
        return res.status(400).json({message: err.message});   
    }
}

export const updateprofile = async(req,res)=>{
    try {
        console.log("=== UPDATE PROFILE DEBUG ===");
        console.log("Request body:", req.body);
        console.log("ProfilePic received:", !!req.body.profilePic);
        console.log("User from middleware:", req.user ? req.user._id : "No user");
        
        const {profilePic} = req.body;
        
        if(!profilePic) {
            return res.status(400).json({message: "No Profile pic provided"});
        }
        
        if(!req.user) {
            return res.status(401).json({message: "User not authenticated"});
        }
        
        const uploadPic = await cloudinary.uploader.upload(profilePic);
        
        const updatedUser = await User.findByIdAndUpdate(
            req.user._id, 
            {profilePic: uploadPic.secure_url}, 
            {new: true}
        ).select("-password");
        
        return res.status(200).json({
            message: "Profile picture updated successfully", 
            user: updatedUser
        });
    } catch (error) {
        console.error("Error updating profile:", error);
        return res.status(500).json({message: error.message});
    }
}



export const checkAuth = (req, res) => {
    try {
        res.status(200).json({ user: req.user });
    } catch (err) {
        return res.status(400).json({ message: err.message });
    }
}