import multer from "multer"
import UserModel from "../models/User.js"
import bcrypt from "bcrypt"
import Employee from "../models/Employee.js"
import EmployeeModel from "../models/Employee.js"
// import { v2 as cloudinary } from 'cloudinary';
// import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { put } from '@vercel/blob';

//to store images uploaded
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, "public/uploads") //cb; callback func
//     },
//     filename: (req, file, cb) => {
//         cb(null, Date.now() + path.extname(file.originalname))
//     }
// })

// cloudinary.config({
//     cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//     api_key: process.env.CLOUDINARY_API_KEY,
//     api_secret: process.env.CLOUDINARY_API_SECRET
// });

// const storage = new CloudinaryStorage({
//     cloudinary: cloudinary,
//     params: {
//         folder: 'employee_images',
//         allowed_formats: ['jpg', 'png', 'jpeg'],
//     }
// });

const storage = multer.memoryStorage();
const upload = multer({ 
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPEG, PNG allowed.'));
        }
    }
});

// const upload = multer({storage})

const addEmployee = async (req, res) => {
    try {
        const {
        name,
        email,
        // employeeId,
        dob,
        gender,
        maritalStatus,
        designation,
        department,
        salary,
        password,
        role,
        shiftStartTime,
        shiftEndTime 
    } = req.body

    console.log("Adding employee:", { name, email, role, shiftStartTime, shiftEndTime });

    const user = await UserModel.findOne({email})
    if(user) {
        return res.status(400).json({success: false, error: "user already registered in emp"})
    }

     // Auto-generate employee ID
        const employeeCount = await EmployeeModel.countDocuments();
        const employeeId = `EMP${String(employeeCount + 1).padStart(4, '0')}`; // Generates EMP0001, EMP0002, etc

    let profileImageUrl = "";

        // Upload to Vercel Blob
        if (req.file) {
            console.log(" Uploading to Vercel Blob...");

            try {
            const blob = await put(
                `employee-images/${employeeId}-${Date.now()}-${req.file.originalname.split('.').pop()}`,
                req.file.buffer,
                {
                    access: 'public',
                    token: process.env.BLOB_READ_WRITE_TOKEN,
                }
            );
            profileImageUrl = blob.url;
            console.log("Image uploaded:", profileImageUrl);
        } catch (uploadError) {
            console.error(" Blob upload error:", uploadError);
                // Continue without image if upload fails
                profileImageUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=500&background=random&color=fff&bold=true`;
            }
        
        } else {
            //  No file uploaded - use placeholder
            profileImageUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=500&background=random&color=fff&bold=true`;
        }

   
    
    const hashPassword = await bcrypt.hash(password, 10)

    const newUser = new UserModel ({
        name,
        email,
        password: hashPassword,
        role,
        profileImage: profileImageUrl  //if the image exist, restore the image in the serve, else if nothing is uploaded, return an empty string
    })
    const savedUser = await newUser.save() // new created user will be stored here inside the saved user

    const newEmployee = new Employee({
        userId: savedUser._id,
        employeeId,
        dob, 
        gender,
        maritalStatus,
        designation,
        department,
        salary,
        shiftStartTime: shiftStartTime || "09:00",
        shiftEndTime: shiftEndTime || "17:00"       
    })

    await newEmployee.save()

    return res.status(200).json({success:true, message: "employee created"})
    } catch (error) {
        console.log(error.message)
        res.status(500).json({success: false, error: "server error in adding employee"})
    }
    
}

const getEmployees = async (req, res) => {
    try {
        const employees = await EmployeeModel.find().populate("userId", {password: 0}).populate("department"); // Find all employees in the database, populate userId nd Department and prevent returning of passwprd
        return res.status(200).json({success: true, employees}) // Return the list of employees
    } catch (error) {
        console.error("Error fetching employees:", error);
        return res.status(500).json({ error: "Get employees server error" });
    }
}

const getEmployee = async (req, res) => {
    const  {id} = req.params;

    // Validate ID BEFORE the try-catch
    if (!id || id === 'undefined' || id === 'null') {
        console.log("Invalid ID received:", id);
        return res.status(400).json({ 
            success: false, 
            error: "Invalid employee ID" 
        });
    }

    try {
        let employee;
        console.log("Fetching employee with ID:", id);
        // First try to find by employee _id
        employee = await EmployeeModel.findById(id).populate("userId", {password: 0}).populate("department"); // Find an employee in the database, populate userId nd Department and prevent returning of passwprd
        // If not found, try to find by userId
        if(!employee) {
            employee = await EmployeeModel.findOne({userId: id}).populate("userId", {password: 0}).populate("department");
        }
        if (!employee) {
            console.log("Employee not found for ID:", id);
            return res.status(404).json({ 
                success: false, 
                error: "Employee not found" 
            });
        }
        return res.status(200).json({success: true, employee}) // Return the list of employee
    } catch (error) {
        console.error("Error fetching employee:", error);
        return res.status(500).json({ error: "Get employee server error" });
    }
}

// controllers/employeeController.js
const updateEmployee = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, maritalStatus, designation, salary, department, shiftStartTime, shiftEndTime } = req.body;

        // Find the employee
        const employee = await EmployeeModel.findById(id);
        if (!employee) {
            return res.status(404).json({ success: false, error: "Employee not found" });
        }

        // Update user info
        await UserModel.findByIdAndUpdate(employee.userId, { name });

        // Update employee info
        const updatedEmployee = await EmployeeModel.findByIdAndUpdate(
            id,
            { maritalStatus, designation, salary, department, shiftStartTime, shiftEndTime },
            { new: true }
        ).populate("userId", { password: 0 }).populate("department");

        console.log("Employee updated with shift:", {
            shiftStartTime: updatedEmployee.shiftStartTime,
            shiftEndTime: updatedEmployee.shiftEndTime,
            estimatedWorkHours: updatedEmployee.estimatedWorkHours
        });

        return res.status(200).json({ success: true, employee: updatedEmployee });
    } catch (error) {
        console.error("Error updating employee:", error);
        return res.status(500).json({ success: false, error: "Update employee server error" });
    }
}

const fetchEmployeesByDepId = async (req, res) => {
    const  {id} = req.params;
    try {
        const employees = await EmployeeModel.find({department: id}) //find department by id
        return res.status(200).json({success: true, employees}) // Return the list of employee
    } catch (error) {
        console.error("Error fetching employee:", error);
        return res.status(500).json({ error: "Get employeesbyDepId server error" });
    }
}

export { addEmployee, upload, getEmployees, getEmployee, updateEmployee, fetchEmployeesByDepId };

