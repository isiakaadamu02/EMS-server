import Attendance from "../models/Attendance.js";
import EmployeeModel from "../models/Employee.js";

const getAttendance = async (req, res) => {
    try {
        // const date = new Date().toISOString().split("T")[0]
        const {date} = req.query;

        let query = {};

        if (date) {
            const startDate = new Date(date);
            startDate.setHours(0, 0, 0, 0);

            const endDate = new Date(date);
            endDate.setHours(23, 59, 59, 999);

            query.date = {$gte: startDate, $lte: endDate};
        } else {
            // Default to today
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            
            query.date = { $gte: today, $lt: tomorrow };
        }
        
        //return attendance and employee datas already bcos attendance has connection with employee
        const attendance = await Attendance.find(query).populate({
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
       const {status, date} = req.body;
       console.log("Updating attendance for:", employeeId, "Status:", status, "Date:", date);
    //    const date = new Date().toISOString().split("T")[0]
    //    Determine which date to use
        let attendanceDate = date ? new Date(date) : new Date();
        attendanceDate.setHours(0, 0, 0, 0);
        
        const nextDay = new Date(attendanceDate);
        nextDay.setDate(nextDay.getDate() + 1);

       const employee = await EmployeeModel.findOne({employeeId});

       if (!employee) {
            return res.status(404).json({ success: false, error: "Employee not found" });
        }

       console.log(" Found employee _id:", employee._id);

       const attendance = await Attendance.findOneAndUpdate(
            { 
                employeeId: employee._id, 
                date: { $gte: attendanceDate, $lt: nextDay}
            }, 
            {
                status,
                markedBy: "admin"
            }, {new: true}
        ).populate({
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

// Employee - Clock In
const clockIn = async (req, res) => {
    try {
        const { userId } = req.user;
        console.log(" Clock in request for user:", userId);

        const employee = await EmployeeModel.findOne({ userId });

        if (!employee) {
            return res.status(404).json({ success: false, error: "Employee not found" });
        }

        //getting date
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Check if already clocked in today
        let attendance = await Attendance.findOne({
            employeeId: employee._id,
            date: { $gte: today, $lt: tomorrow}
        });

        //checked if user is already clockedIn
        if (attendance && attendance.clockIn) {
            return res.status(400).json({ success: false, error: "Already Clocked in Today",
                clockIn: attendance.clockIn
            });
        }

        //if user is not clocked in yet then...
        if (!attendance) {
            //Create new attendance record
            attendance = new Attendance({
                employeeId: employee._id,
                date: new Date(),
                clockIn: new Date(),
                markedBy: "employee"
            })
        } else {
            // Update existing record
            attendance.clockIn = new Date();
            attendance.markedBy = "employee";
        }

        await attendance.save();

        console.log(" Clocked in:", attendance.clockIn);
        
        res.status(200).json({ success: true, message: "Clocked in successfully", clockIn: attendance.clockIn, attendance });
    } catch (error) {
        console.error("Error clocking in:", error.message);
        return res.status(500).json({ success: false, error: "Clock In server error" });
    }
}

// Employee - Clock Out
const clockOut = async (req, res) => {
    try {
        const { userId } = req.user;
        console.log(" Clock out request for user:", userId);

        const employee = await EmployeeModel.findOne({ userId });
        if (!employee) {
            return res.status(404).json({ success: false, error: "Employee not found" });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        //get employee clockin attendance
        const attendance = await Attendance.findOne({
            employeeId: employee._id,
            date: { $gte: today, $lt: tomorrow }
        });

        //if the user has not clocked in yet
        if (!attendance || !attendance.clockIn) {
            return res.status(400).json({ 
                success: false, 
                error: "You haven't clocked in yet today" 
            });
        }

        //if the user has already clocked out
        if (attendance.clockOut) {
            return res.status(400).json({ 
                success: false, 
                error: "Already clocked out today",
                clockOut: attendance.clockOut,
                totalHours: attendance.totalHours
            });
        }

        attendance.clockOut = new Date();

         const diff = attendance.clockOut.getTime() - attendance.clockIn.getTime();
        attendance.totalHours = diff / (1000 * 60 * 60); // Convert to hours
        
        // ✅ Set status to Present
        if (!attendance.status) {
            attendance.status = "Present";
        }
        
        await attendance.save(); // Pre-save hook will calculate totalHours

        console.log("Clocked out. Total hours:", attendance.totalHours);
        
        res.status(200).json({ 
            success: true, message: "Clocked out successfully",
            clockIn: attendance.clockIn, clockOut: attendance.clockOut,totalHours: attendance.totalHours,
            attendance
        });

    } catch (error) {
        console.error("Error clocking out:", error.message);
        return res.status(500).json({ success: false, error: error.message || "Clock out server error" });
    }
}

// Employee - Get today's attendance status
const getTodayAttendance = async (req, res) => {
    try {
        const { userId } = req.user;

        console.log(" Fetching today's attendance for userId:", userId);

        const employee = await EmployeeModel.findOne({ userId });
        
        if (!employee) {
            console.log("No employee found with userId:", userId);
            return res.status(404).json({ success: false, error: "Employee not found" });
        }
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const attendance = await Attendance.findOne({
            employeeId: employee._id,
            date: { $gte: today, $lt: tomorrow }
        });

        console.log(" Today's attendance:", attendance ? "Found" : "Not found");

        res.status(200).json({ success: true, attendance: attendance || null });
    } catch (error) {
        console.error("Get today attendance error:", error.message);
        return res.status(500).json({ success: false, error: error.message || "Get today attendance error" });
    }
}

// Employee - Get attendance history
const getAttendanceHistory = async (req, res) => {
    try {
        const { userId } = req.user;
        const {limit = 30, skip = 0} = req.query;

        const employee = await EmployeeModel.findOne({ userId });
        
        if (!employee) {
            return res.status(404).json({ success: false, error: "Employee not found" });
        }

        const attendance = await Attendance.find({
            employeeId: employee._id,
            clockIn: { $ne: null }  // Only show records where employee clocked in
        }).sort({ date: -1 }).limit(parseInt(limit)).skip(parseInt(skip));

        res.status(200).json({ success: true, attendance });
    } catch (error) {
        console.error("Attendance history error:", error.message);
        return res.status(500).json({ success: false, error: error.message || "Error getting attendance history" });
    }
}

//Admin - Attendance Report
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
            if (!record.employeeId) return result;

            const dateKey = new Date(record.date).toISOString().split('T')[0];

            if(!result[dateKey]) {
                result[dateKey] = []
            }

            result[dateKey].push({
                employeeId: record.employeeId?.employeeId || "N/A",
                employeeName: record.employeeId?.userId?.name || "Unknown",
                departmentName: record.employeeId?.department?.dep_name || "No Department",
                status: record.status || "Not Marked",
                clockIn: record.clockIn,
                clockOut: record.clockOut,
                totalHours: record.totalHours ? record.totalHours.toFixed(2) : "0.00"
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

export {getAttendance, updateAttendance, attendanceReport, clockIn, clockOut, getTodayAttendance, getAttendanceHistory} 