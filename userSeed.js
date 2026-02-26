import connectToDatabase from "./db/db.js"
import UserModel from "./models/User.js"
import bcrypt from "bcrypt"


//register admin user
const adminRegister = async () => {
    connectToDatabase();
    try {
        //hash the password before saving to database
        const hashPassword = await bcrypt.hash("admin123", 10)
        const newAdmin = new UserModel({
            name: "Admin",
            email: "admin@gmail.com",
            password: hashPassword,
            role: "admin"
        })
        await newAdmin.save()
    } catch (error) {
        console.log(error)
    }
} 

adminRegister();