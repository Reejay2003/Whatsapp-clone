import Message from "../models/message.model.js";
import User from "../models/user.model.js";

export const getUserForSidebar = async(req,res) =>{
    try {
        const loggedInUser = req.user._id;
        const otherUsers = await User.find({_id:{$ne: loggedInUser}}).select("-password");
        res.status(200).json(otherUsers);
    } catch (err) {
        return res.status(400).json({error: err.message});   
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
      });
  
      res.status(200).json(messages);
    } catch (error) {
      console.log("Error in getMessages controller: ", error.message);
      res.status(500).json({ error: "Internal server error" });
    }
  };
  

export const sendMessage = async(req,res) =>{
    try {
        const {image,text} = req.body;
        const {id:UsertoChat}=req.params;
        const senderid = req.user._id;
        let imageUrl;
        if(image){
            const uploadPic = cloudinary.uploader.upload(profilePic);
            imageUrl = uploadPic.secure_url;
        }

        const newMessage = new Message({
            senderId:senderid,
            receiverId:UsertoChat,
            image:imageUrl,
            text
        });

        await newMessage.save();
        res.status(201).json(newMessage);
    } catch (err) {
        return res.status(400).json({error: err.message});   
    }
}