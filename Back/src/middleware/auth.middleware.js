import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protectRoute = async (req,res,next)=>{
    try {
        // Checking for the token in the cookie.
        const token =req.cookies.jwt;

        // If token is not present -> Unauthorised access
        if(!token){
            return res.status(401).json({message:"Unauthorized - No Token Provided"})
        }

        // If token is present then we need to verify it.
        const decoded = jwt.verify(token,process.env.JWT_SECRET);

        if(!decoded){
            return res.status(401).json({message : "Unauthorized - Invalid Token !"});
        }

        // If token is verified then we need to find the user in the DB and we are selecting all information
        // except the password.
        const user = await User.findById(decoded.userId).select("-password")

        if(!user)
        {
            res.status(404).json({message : "User not found !"});
        }

        // Now we know that user is authenticated so we will add this user details in the req and call
        // the next function.

        req.user = user;

        next();

    } catch (error) {
        console.log("Error in protectRoute middleware ! ",error.message);
        res.status(500).json({message : "Internal Server Error !"});
        
    }
}

export default protectRoute;
