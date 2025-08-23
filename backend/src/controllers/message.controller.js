import { getReceiverSocketId } from "../lib/socket.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import { v2 as cloudinary } from "cloudinary";
import { io } from "../lib/socket.js";

export const getUserForSidebar = async(req, res) => {
    try {
        const loggedInUser = req.user._id;
        const otherUsers = await User.find({_id: {$ne: loggedInUser}}).select("-password");
        return res.status(200).json(otherUsers);
    } catch (err) {
        console.log("Error in getUserForSidebar:", err.message);
        return res.status(500).json({error: "Internal server error"});   
    }
}

export const getMessages = async (req, res) => {
    try {
        const { id: userToChatId } = req.params;
        const myId = req.user._id;

        const messages = await Message.find({
            $or: [
                { senderId: myId, receiverId: userToChatId },
                { senderId: userToChatId, receiverId: myId },
            ],
        }).sort({ createdAt: 1 }); // Sort by creation time for proper order

        return res.status(200).json(messages);
    } catch (error) {
        console.log("Error in getMessages controller:", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};
  
export const sendMessage = async(req, res) => {
    try {
        const { image, text } = req.body;
        const { id: userToChatId } = req.params;
        const senderId = req.user._id;

        // Validate that we have either text or image
        if (!text && !image) {
            return res.status(400).json({ error: "Message must contain text or image" });
        }

        let imageUrl;
        if (image) {
            try {
                // Fixed: Use proper variable name and await the upload
                const uploadResponse = await cloudinary.uploader.upload(image);
                imageUrl = uploadResponse.secure_url;
            } catch (uploadError) {
                console.log("Error uploading image:", uploadError);
                return res.status(500).json({ error: "Failed to upload image" });
            }
        }

        const newMessage = new Message({
            senderId,
            receiverId: userToChatId,
            image: imageUrl,
            text: text || ""
        });

        await newMessage.save();

        // Emit to receiver
        const receiverSocketId = getReceiverSocketId(userToChatId);
        if(receiverSocketId){
            console.log("Emitting message to receiver:", userToChatId);
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }

        // IMPORTANT: Also emit to sender so they see their own message in real-time
        const senderSocketId = getReceiverSocketId(senderId.toString());
        if(senderSocketId){
            console.log("Emitting message to sender:", senderId);
            io.to(senderSocketId).emit("newMessage", newMessage);
        }

        console.log("Message saved and emitted:", {
            messageId: newMessage._id,
            from: senderId,
            to: userToChatId,
            receiverOnline: !!receiverSocketId,
            senderOnline: !!senderSocketId
        });

        res.status(201).json(newMessage);
    } catch (err) {
        console.log("Error in sendMessage controller:", err.message);
        return res.status(500).json({error: "Internal server error"});   
    }
}