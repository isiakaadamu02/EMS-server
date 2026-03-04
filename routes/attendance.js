import express from "express"
import { attendanceReport, getAttendance, updateAttendance } from "../controllers/attendanceController.js"
import authMiddleware from "../middleware/authMiddleware.js"
import defaultAttendance from "../middleware/defaultAttendance.js"

const router = express.Router()
//authmiddleware verifies if user is logged in
//defaultAttendance middleware verifies if user has attendance
router.get("/", authMiddleware, defaultAttendance, getAttendance)
router.put("/update/:employeeId", authMiddleware, updateAttendance)
router.get("/report", authMiddleware, attendanceReport)

export default router;