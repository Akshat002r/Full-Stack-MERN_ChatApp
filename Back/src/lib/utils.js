import jwt from "jsonwebtoken";

export const generateToken = (userId,res)=>{
    const token = jwt.sign({userId},process.env.JWT_SECRET,{
        expiresIn:'7d'
    })

    res.cookie("jwt",token,{
        maxAge : 7 * 24 * 60 * 60 * 1000, // in ms
        httpOnly : true, // Prevents XSS Attacks : Cross Site Scripting Attacks.
        sameSite : "strict", // CSRF attacks cross-site requests forgery attacks
        secure : process.env.NODE_ENV !=="development"
    });

    return token;
}