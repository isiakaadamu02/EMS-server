import UserModel from "../models/User.js";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log(email, password);
        //if the user email exists
        const user = await UserModel.findOne({email})
        if(!user) {
            res.status(404).json({success: false, error: "User not found"})
        }

        //if password is matched with the user password in database
        //passed password and encrypting the password
        const isMatch = await bcrypt.compare(password, user.password)
        if(!isMatch) {
            res.status(404).json({success: false, error: "Wrong Password"})
        }

        const token = jwt.sign({ _id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "10d" })
        res.status(200).json({success: true, token, user: {_id: user._id, name: user.name, role: user.role}})
    } catch (error) {
        console.log(error.message)
        res.status(500).json({success: false, error: error.message})
    }
}

const verify = (req, res) => {
    return res.status(200).json({success: true, user: req.user})
}

export { login, verify }