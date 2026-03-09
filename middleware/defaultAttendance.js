import Attendance from "../models/Attendance.js";
import EmployeeModel from "../models/Employee.js";

const defaultAttendance = async (req, res, next) => {
    try {
        const date = new Date().toISOString().split("T")[0]; //"yyyy-mm-ddThh:mm:ss.sssZ" -> "yyyy-mm-dd"

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        console.log("Checking attendance for:", today.toISOString().split("T")[0]);

        //if there are employees that are already marked, leave it. 
        const existingAttendance = await Attendance.findOne({
            date: {
                $gte: today,
                $lt: tomorrow
            }
        });

        // If no attendance exists for today, create records for all employees on the table
        if(!existingAttendance) {
            console.log("Creating default attendance records");
            //get the employees
            const employees = await EmployeeModel.find({});
            console.log(` Found ${employees.length} employees`);

             if (employees.length > 0) {
                // Map through employees and create attendance records with Date objects
                const attendanceRecords = employees.map(employee => ({
                    date: today, //  Use Date object
                    employeeId: employee._id,
                    status: null
                }));
                
                await Attendance.insertMany(attendanceRecords);
                console.log(" Created attendance records for today");
            }
        } else {
            console.log(" Attendance records already exist for today");
        }
        next();
    } catch (error) {
        console.error(" Error in defaultAttendance:", error);
        res.status(500).json({success: false, error: error})
    }
} 

export default defaultAttendance;