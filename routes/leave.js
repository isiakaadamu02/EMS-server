import express from "express"
import authMiddleware from "../middleware/authMiddleware.js"
import { addLeave, getLeave, getLeaveDetail, getLeaves, updateLeave } from "../controllers/leaveController.js";

const router = express.Router()

//authmiddle will very the user, if the user is okay it will call de addLeave to the database
router.post("/add", authMiddleware, addLeave)
router.get("/", authMiddleware, getLeaves)
router.get("/detail/:id", authMiddleware, getLeaveDetail)
router.get("/:id/:role", authMiddleware, getLeave)  
router.put("/:id", authMiddleware, updateLeave)



export default router;