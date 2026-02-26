import EmployeeModel from "../models/Employee.js";
import LeaveModel from "../models/Leave.js";

//add leave from the employee side
const addLeave = async (req, res) => {
    try {
            const {userId, leaveType, startDate, endDate, reason} = req.body
            // const employee = await EmployeeModel.findOne({userId})
    
            console.log(" Received leave data:", req.body);

              // Find the employee document using userId
            const employee = await EmployeeModel.findOne({ userId });

            if (!employee) {
            return res.status(404).json({ success: false, error: "Employee not found" });
        }
    
            const newLeave = new LeaveModel({
                employeeId: employee._id,
                leaveType,
                startDate,
                endDate,
                reason
            })
    
            await newLeave.save()
    
            return res.status(200).json({success: true})
        } catch (error) {
            console.error(" Error adding leave:", error);
            return res.status(500).json({success: false, error: "add leave server error"})
        }
}

//  const getLeave = async (req, res) => {
//     try {
//         const {id, role} = req.params;
//         console.log("Getting leaves for ID:", id);
//         let leaves;
//         //if logged in as admin it will directly find the admin leaves
//         if(role === "admin") {
//             leaves = await LeaveModel.find({employeeId: id})
//         } else {
//             //find leave based on employee id
//         //if logged in as employee, this code runs first, finds the employee and then find the leaves
//             if(!leaves || leaves.length === 0) {
//             const employee = await EmployeeModel.findOne({userId: id})

//             leaves = await LeaveModel.find({employeeId: employee._id})
//         }
//         }
//         return res.status(200).json({success: true, leaves})
//     } catch (error) {
//         console.error(" Error adding leave:", error);
//         return res.status(500).json({success: false, error: "get leave server error"})
//     }
// }

const getLeave = async (req, res) => {
    try {
        const { id, role } = req.params;
        console.log(" Getting leaves for ID:", id, role);
        
        let leaves;
        
        if(role === "admin") {
            // find leaves directly by employeeId (admin passing employee._id)
            leaves = await LeaveModel.find({ employeeId: id }).sort({ appliedAt: -1 });
            console.log(" Direct search found:", leaves.length, "leaves");
        } else {
            // If no leaves found, try to find employee by userId (employee login)
            if (!leaves || leaves.length === 0) {
                console.log(" Searching for employee with userId:", id);
                
                //  CRITICAL FIX: Use findOne (returns object), not find (returns array)
                const employee = await EmployeeModel.findOne({ userId: id });
                
                if (employee) {
                    console.log(" Found employee with _id:", employee._id);
                    leaves = await LeaveModel.find({ employeeId: employee._id }).sort({ appliedAt: -1 });
                    console.log(" Found", leaves.length, "leaves for employee");
                } else {
                    console.log(" No employee found with userId:", id);
                    leaves = [];
                }
            }
        }

        return res.status(200).json({ success: true, leaves });
    } catch (error) {
        console.error(" Error getting leaves:", error);
        return res.status(500).json({ success: false, error: "Get leaves server error" });
    }
}

//get leave table from the admin side
const getLeaves = async (req, res) => {
    try {
        //sum: first find all record in leave model. get empl data, frm empl data get dept & user
        // leave has connection with empl, so first populate data of empl
        // emplId is the reference to empl table in leave model. nd empl table has connection with dept and user, so emplId will be used to fetch dept and user data
        const leaves = await LeaveModel.find().populate({
            path: "employeeId",
            populate: [
                {
                    path: "department",
                    select: "dep_name"
                },
                {
                    path: "userId",
                    select: "name"
                }
            ]
        })
        return res.status(200).json({success: true, leaves})
    } catch (error) {
        console.error(" Error getting leaves:", error);
        return res.status(500).json({success: false, error: "get leaves server error"})
    }
}

//view leave detail from the admin side
const getLeaveDetail = async (req, res) => {
    try {
        const {id} = req.params;

        console.log("Getting leave details for leave ID:", id);
        console.log("Type of id:", typeof id); 

        const leave = await LeaveModel.findById(id).populate({
            path: "employeeId",
            populate: [
                {
                    path: "department",
                    select: "dep_name"
                },
                {
                    path: "userId",
                    select: "name profileImage"
                }
            ]
        })

        if (!leave) {
            return res.status(404).json({ success: false, error: "Leave not found" });
        }
        console.log("Found leave:", leave);

        return res.status(200).json({success: true, leave})
    } catch (error) {
        console.error(" Error getting leave detail:", error);
        return res.status(500).json({success: false, error: "get leave details server error"})
    }
}

//update leave detail from the admin side
const updateLeave = async (req, res) => {
   try {
     const {id} = req.params;
     const { status } = req.body;
     console.log("Updating leave status:", id, status)

    const leave = await LeaveModel.findByIdAndUpdate(id, {status}, {new: true})
    if(!leave) {
        return res.status(404).json({ success: false, error: "Leave not found" });
    }

    return res.status(200).json({success: true, leave})
   } catch (error) {
        console.error(" Error getting leave detail:", error);
            return res.status(500).json({success: false, error: "get leave details server error"})
   }
    
}



export {addLeave, getLeave, getLeaves, getLeaveDetail, updateLeave}