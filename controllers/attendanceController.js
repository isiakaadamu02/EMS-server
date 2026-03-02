import Attendance from "../models/Attendance.js";

const getAttendance = async (req, res) => {
    try {
        const date = new Date().toISOString().split("T")[0]
        
        //return attendance and employee datas already bcos attendance has connection with employee
        const attendance = await Attendance.find({date}).populate({
            path: "employeeId",
            populate: [
                "department",
                "userId"
            ]
        })
        res.status(200).json({success: true, attendance})
    } catch (error) {
        console.error("Error fetching attendance:", error.message);
        return res.status(500).json({ success: false, error: "Get attendance server error" });
    }
}

export {getAttendance} 