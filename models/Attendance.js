import mongoose from "mongoose";


const AttendanceSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee",
        required: true
    },
    status: {
        type: String,
        enum: ["Present", "Absent", "Sick", "Leave"],
        default: null
    },

    //for clock in and clock out
    clockIn: {
        type: Date,
        default: null
    },
    clockOut: {
        type: Date,
        default: null
    },
    totalHours: {
        type: Number,  // Store in hours (e.g., 8.5 for 8 hours 30 minutes)
        default: 0
    },
    // Track if manually marked by admin
    markedBy: {
        type: String,
        enum: ["employee", "admin", null],
        default: null
    }
},
{
    timestamps: true
}
)

//calculate total hours befor saving
// AttendanceSchema.pre("save", function(next) {
//     // Calculate total hours if both clockIn and clockOut exist
//     if (this.clockIn && this.clockOut) {
//         const clockDiff = this.clockOut - this.clockIn;
//         this.totalHours = clockDiff / (1000 * 60 * 60);

//         //Auto-set status to Present if clocked in/out
//         if (!this.status || this.status === null) {
//             this.status = "Present"
//         }
//     }
//     next();
// })

const Attendance = mongoose.model("Attendance", AttendanceSchema)
export default Attendance