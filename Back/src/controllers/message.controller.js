import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId , io } from "../lib/socket.js";


// Getting Users for SideBar
export const getUsersForSidebar =  async(req,res)=>{
    try {
        const loggedInUserId = req.user._id;
        // All users except the one which is logged in
        // Also getting all information except the password.
        const filteredUsers = await User.find({_id : {$ne : loggedInUserId}}).select("-password");

        res.status(200).json(filteredUsers);
    } catch (error) {
        console.log("Error in getUsersForSidebar controller : ",error.message);
        res.status(500).json({error : "Internal Server Error !"});
    }
}

// Getting messages of a particular user with a particular user i.e Chat Window
export const getMessages = async(req,res)=>{
    try {
        // User with whom i want to display the chat message
        const {id : userToChatId}=req.params;

        // Me or Currently Authenticated User
        const myId = req.user._id;

        // Finding messages between the two
        const messages = await Message.find({
            $or : [
                {senderId:myId,receiverId:userToChatId},
                {senderId:userToChatId,receiverId:myId}
            ]
        })

        res.status(200).json(messages);


    } catch (error) {
        console.log("Error in getMessage controller : ",error.message);
        res.status(500).json({error : "Internal Server Error !"});
        
    }
}

// Sending Message to a particular user
export const sendMessage = async(req,res)=>{
    try {
        // User to whom message is being sent.
        const {id : receiverId} = req.params
        // User(me) who is sending this message.
        const senderId  = req.user._id;

        // Message can contain either text or an image.
        const {text,image} = req.body;

        let imageUrl;
        if(image)
        {
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image : imageUrl
        })

        await newMessage.save();

        const receiverSocketId = getReceiverSocketId(receiverId);
        if(receiverSocketId){
            io.to(receiverSocketId).emit("newMessage",newMessage);
        }

        res.status(201).json(newMessage);


    } catch (error) {
        console.log("Error in sendMessage controller ! ",error.message);
        res.status(500).json({error : "Internal Server Error !"});
    }
}