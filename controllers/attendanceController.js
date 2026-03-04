import Attendance from "../models/Attendance.js";
import EmployeeModel from "../models/Employee.js";

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
        
        console.log("Found attendance records:", attendance.length);
        res.status(200).json({success: true, attendance})
    } catch (error) {
        console.error("Error fetching attendance:", error.message);
        return res.status(500).json({ success: false, error: "Get attendance server error" });
    }
}

const updateAttendance = async (req, res) => {
    try {
       const {employeeId} = req.params;
       const {status} = req.body;
       const date = new Date().toISOString().split("T")[0]
       const employee = await EmployeeModel.findOne({employeeId})

       console.log(" Found employee _id:", employee._id);

       const attendance = await Attendance.findOneAndUpdate({ employeeId: employee._id, date }, {status}, {new: true}).populate({
            path: "employeeId",
            populate: [
                { path: "department", select: "dep_name" },
                { path: "userId", select: "name" }
            ]
        });

        if (!attendance) {
            console.log("Attendance record not found");
            return res.status(404).json({ success: false, error: "Attendance record not found" });
        }

        console.log("this is attendance", attendance)
       res.status(200).json({success: true, attendance});
    } catch (error) {
        console.error("Error fetching attendance:", error.message);
        return res.status(500).json({ success: false, error: "Update attendance server error" });
    }
}


const attendanceReport = async (req, res) => {
    try {
        //display 5 reports on first view(limit=5), by default no skipping any reports(skip=0)
        const {date, limit = 5, skip = 0} = req.query;
        const query = {};

        ///pass date from Frontend and attach the date to the query
        if(date) {
            query.date = date;
        }

        const attendanceData = await Attendance.find(query).populate({
            path: "employeeId",
            populate: [
                { path: "department", select: "dep_name" },
                { path: "userId", select: "name" }
            ]
        })
        .sort({date: -1})
        .limit(parseInt(limit))
        .skip(parseInt(skip))

        console.log("Found records:", attendanceData.length);

        //group data based on date
        const groupData = attendanceData.reduce((result, record) => {
            const dateKey = new Date(record.date).toISOString().split('T')[0];
            if(!result[dateKey]) {
                result[dateKey] = []
            }
            result[dateKey].push({
                employeeId: record.employeeId?.employeeId || "N/A",
                employeeName: record.employeeId?.userId?.name || "Unknown",
                departmentName: record.employeeId?.department?.dep_name || "No Department",
                status: record.status || "Not Marked"
            })
            return result;
        }, {})
        console.log(" Grouped data:", Object.keys(groupData));
        return res.status(201).json({success: true, groupData})
    } catch (error) {
        console.error("Error fetching attendance report:", error.message);
        return res.status(500).json({ success: false, error: "Attendance report server error" });
    }
}

export {getAttendance, updateAttendance, attendanceReport} 