import express from "express"
import { attendanceReport, clockIn, clockOut, getAttendance, getAttendanceHistory, getTodayAttendance, updateAttendance } from "../controllers/attendanceController.js"
import authMiddleware from "../middleware/authMiddleware.js"
import defaultAttendance from "../middleware/defaultAttendance.js"

const router = express.Router()
//authmiddleware verifies if user is logged in
//defaultAttendance middleware verifies if user has attendance

// Employee routes
router.post("/clock-in", authMiddleware, clockIn)
console.log("POST /clock-in registered");
router.post("/clock-out", authMiddleware, clockOut)
console.log("POST /clock-out registered");
router.get("/today", authMiddleware, getTodayAttendance)
console.log("GET /today registered");
router.get("/history", authMiddleware, getAttendanceHistory)
console.log("GET /history registered");
router.get("/report", authMiddleware, attendanceReport)
console.log("GET /report registered");

//admin
router.get("/", authMiddleware, defaultAttendance, getAttendance)
console.log("GET / registered");
router.put("/update/:employeeId", authMiddleware, updateAttendance)
console.log("PUT /update/:employeeId registered");


export default router;