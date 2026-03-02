import express from "express"
import { getAttendance } from "../controllers/attendanceController.js"
import authMiddleware from "../middleware/authMiddleware.js"
import defaultAttendance from "../middleware/defaultAttendance.js"

const router = express.Router()
//authmiddleware verifies if user is logged in
//defaultAttendance middleware verifies if user has attendance
router.post("/", authMiddleware, defaultAttendance, getAttendance)

export default router;