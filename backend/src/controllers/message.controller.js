import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import { v2 as cloudinary } from "cloudinary";
import { io, getReceiverSocketId } from "../lib/socket.js";

export const getUserForSidebar = async (req, res) => {
  try {
    const loggedInUser = await User.findById(req.user._id);
    if (!loggedInUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const addedUsers = await User.find({
      _id: { $in: loggedInUser.addedPpl },
    }).select("-password");

    return res.status(200).json(addedUsers);
  } catch (err) {
    console.log("Error in getUserForSidebar:", err.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const setUserForSidebar = async (req, res) => {
  try {
    const { email } = req.body;
    const myId = req.user._id;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const userToAdd = await User.findOne({ email });
    if (!userToAdd) {
      return res.status(404).json({ error: "User with this email not found" });
    }

    // Update both users
    const updatedMe = await User.findByIdAndUpdate(
      myId,
      { $addToSet: { addedPpl: userToAdd._id } },
      { new: true }
    ).select("-password");

    const updatedOther = await User.findByIdAndUpdate(
      userToAdd._id,
      { $addToSet: { addedPpl: myId } },
      { new: true }
    ).select("-password");

    if (!updatedMe || !updatedOther) {
      return res.status(404).json({ error: "User not found" });
    }

    // 🔹 Emit socket events with consistent payloads
    const mySocketId = getReceiverSocketId(myId.toString());
    if (mySocketId) {
      io.to(mySocketId).emit("userAdded", updatedOther);
    }

    const otherSocketId = getReceiverSocketId(userToAdd._id.toString());
    if (otherSocketId) {
      io.to(otherSocketId).emit("userAdded", updatedMe);
    }

    return res.status(200).json(updatedMe);
  } catch (err) {
    console.log("Error in setUserForSidebar:", err.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    }).sort({ createdAt: 1 });

    return res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: userToChatId } = req.params;
    const senderId = req.user._id;

    if (text && text.startsWith("e2e1:")) {
      const newMessage = new Message({ senderId, receiverId: userToChatId, text });
      await newMessage.save();
      const receiverSocketId = getReceiverSocketId(userToChatId);
      if (receiverSocketId) io.to(receiverSocketId).emit("newMessage", newMessage);
      return res.status(201).json(newMessage);
    }

    if (!text && !image) {
      return res.status(400).json({ error: "Message must contain text or image" });
    }

    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId: userToChatId,
      text: text || "",
      image: imageUrl,
    });

    await newMessage.save();
    const receiverSocketId = getReceiverSocketId(userToChatId);
    if (receiverSocketId) io.to(receiverSocketId).emit("newMessage", newMessage);

    res.status(201).json(newMessage);
  } catch (err) {
    console.log("Error in sendMessage controller:", err.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};