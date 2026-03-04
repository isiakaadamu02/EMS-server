import Attendance from "../models/Attendance.js";
import EmployeeModel from "../models/Employee.js";

const defaultAttendance = async (req, res, next) => {
    try {
        const date = new Date().toISOString().split("T")[0]; //"yyyy-mm-ddThh:mm:ss.sssZ" -> "yyyy-mm-dd"

        //if there are employees that are already marked, leave it. 
        const existingAttendance = await Attendance.findOne({date});

        //if no attendance, generate employees to the attendace table for that date
        if(!existingAttendance) {
            //get the employees
            const employees = await EmployeeModel.find({});
            //map through the employees and insert the attendance for the date
            const attendance = employees.map(employee => ({
                date, employeeId: employee._id, status: null
            }));
            await Attendance.insertMany(attendance)
        }
        next();
    } catch (error) {
        res.status(500).json({success: false, error: error})
    }
} 

export default defaultAttendance;