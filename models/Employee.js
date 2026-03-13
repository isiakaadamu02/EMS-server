import mongoose, { Schema } from "mongoose";

const employeeSchema = new Schema({
    userId: {type: Schema.Types.ObjectId, ref: "User", required: true},
    employeeId: {type: String, required: true, unique: true},
    dob: {type: Date},
    gender: {type: String},
    maritalStatus: {type: String},
    designation: {type: String},
    department: {type: Schema.Types.ObjectId, ref: "Department", required: true},
    salary: {type: Number, required: true},
    shiftStartTime: { 
        type: String, // Format: "HH:MM" (e.g., "09:00")
        default: "09:00" 
    },
    estimatedWorkHours: { type: Number, default: 8 },
    shiftEndTime: { type: String, default: "17:00" },
    createdAt: {type: Date, default: Date.now},
    updatedAt: {type: Date, default: Date.now},
});


const EmployeeModel = mongoose.model("Employee", employeeSchema);
export default EmployeeModel