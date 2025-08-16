import express from "express";
import User from "../models/user.model.js";
import {generateJWT} from "../lib/utils.js"
import bcrypt from "bcryptjs"
import cloudinary from "../lib/cloudinary.js";
const router = express.Router();


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
            res.status(201).json({newUser});
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
        res.cookie("jwt", "",{maAge: 0});
        return res.status(200).json({message: "User Logged out Successfully"});

    }catch(err){
        return res.status(400).json({message: err.message});   
    }
}


export const updateprofile = (req,res)=>{
    try {
        const{profilePic} = req.body;
        if(!profilePic) return res.status(400).json({message: "NO Profile pic"});
        const uploadPic = cloudinary.uploader.upload(profilePic);
        const updatedUser = User.findByIdAndUpdate(req.user._id, {profilePic:uploadPic.secure_url}, {new:true});
        return res.status(200).json({message: "Updated Profile Pic"});
    } catch (error) {
        return res.status(400).json({message: err.message});
    }
}

export const checkAuth = (req, res) => {
    try {
        res.status(200).json({ user: req.user });
    } catch (err) {
        return res.status(400).json({ message: err.message });
    }
}
