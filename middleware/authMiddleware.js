import jwt from "jsonwebtoken"
import UserModel from "../models/User.js";

const verifyUser = async (req, res, next) => {
    try {
        //split the string "Bearer token" and get the token. in the array take the first element and store inside de token
        const token = req.headers.authorization?.split(" ")[1];
        //if the token does not exists then return unauthorized
        if (!token) {
            return res.status(401).json({ success: false, error: "Unauthorized, Token not provided" });
        }
        
        const decoded = await jwt.verify(token, process.env.JWT_SECRET)
        if(!decoded) {
            return res.status(404).json({success: false, error: "Invalid Token"})
        }

        const user = await UserModel.findById({_id: decoded._id}).select("-password")
        if(!user) {
            return res.status(404).json({success: false, error: "User not found"})
        }
        req.user = user;
        next();
    } catch (error) {
        return res.status(500).json({ error: "Internal server error" });
    }
}

export default verifyUser;