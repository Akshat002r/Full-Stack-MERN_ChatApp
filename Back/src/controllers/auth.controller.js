import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";

export const signup = async (req,res)=>{
    const {fullName,email,password} =  req.body;
    try {
        if(!fullName || !email || !password)
        {
            return res.status(400).json({message : "Please Enter all required fields !"})
        }
        if(password.length < 6){
            return res.status(400).json({message : "Password must be atleast 6 characters !"});
        }

        const user = await User.findOne({email})

        if(user) return res.status(400).json({message : "Email already exists !"});

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password,salt);

        const newUser = new User({
            fullName,
            email,
            password : hashedPassword
        });

        if(newUser){
            // generate jwt token
            generateToken(newUser._id,res)
            await newUser.save();

            res.status(201).json({
                _id : newUser._id,
                fullName:newUser.fullName,
                email:newUser.email,
                profilePic : newUser.profilePic
            });
        }
        else{
            res.status(400).json({message : "Invalid User Data !"})
        }
    } catch (error) {
        console.log("Erro in signup controller !",error.message);
        res.status(500).json({message : "Internal Server Error !"});
    }
};

export const login = async (req,res)=>{
    const {email,password} = req.body;
    try {
        // Checking if user exists in the Database.
        const user = await User.findOne({email});

        // If user does not exists
        if(!user){
            return res.status(400).json({message : "Invalid Credentials !"});
        }

        // User exists -> checking password
        const isPasswordCorrect = await bcrypt.compare(password,user.password);

        // If password is incorrect
        if(!isPasswordCorrect){
            return res.status(400).json({message : "Invalid Credentials !"});
        }

        // If user is validated then 
        generateToken(user._id,res);

        res.status(200).json({
            _id:user._id,
            fullName:user.fullName,
            email:user.email,
            profilePic:user.profilePic
        });



    } catch (error) {
        console.log("Error in Login controller !",error.message);
        res.status(500).json({message:"Internal Server Error !"});
    }
};

export const logout = (req,res)=>{
    try {
        res.cookie("jwt","",{maxAge:0});
        res.status(200).json({message : "Logged out Succesfully !"})
    } catch (error) {
        console.log("Error in Logout Controller !",error.message);
        res.status(500).json({message:"Internal Server Error !"});
    }
};

export const updateProfile = async (req,res)=>{
    try {
        const {profilePic} = req.body;
        // We are already having the user information who has hit this route of update profile pic
        // from the protectedRoute function where we added the user information in the request
        // and then called the next() function.

        const userId = req.user._id;

        // Checking whether the request contains any Profile Pic or not.
        if(!profilePic){
            return res.status(400).json({message : "Profile Pic is required !"});
        }

        // If profile pic is provided then we can upload it to cloudinary bucket
        const uploadResponse = await cloudinary.uploader.upload(profilePic);

        // Now after uploading we must also 
        const updatedUser = await User.findByIdAndUpdate(userId,{profilePic:uploadResponse.secure_url},{new:true});

        res.status(200).json(updatedUser);
        

    } catch (error) {
        console.log("Error in Update Profile !",error);
        res.status(500).json({message : "Internal Server Error !"});
    }
}

export const checkAuth = (req,res)=>{
    try {
        res.status(200).json(req.user);
    } catch (error) {
        console.log('Error in checkAuth Controller !',error.message);
        res.status(500).json({message : "Internal Server Error !"});
    }
}