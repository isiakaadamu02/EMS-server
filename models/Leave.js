import mongoose, { Schema } from "mongoose";

const leaveSchema = new Schema({
    employeeId: {type: Schema.Types.ObjectId, ref: "Employee", required: true},
    leaveType: {type: String, enum: ["Sick Leave", "Casual Leave", "Annual Leave"], required: true},
    startDate: {type: Date, default: Date.now, required: true},
    endDate: {type: Date, default: Date.now, required: true},
    reason: {type: String, required: true},
    status: {type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending"},
    appliedAt: {type: Date, default: Date.now},
    updateAt: {type: Date, default: Date.now},
})

const LeaveModel = mongoose.model("Leave", leaveSchema);
export default LeaveModel