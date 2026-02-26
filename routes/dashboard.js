import express from "express"
import authMiddleware from "../middleware/authMiddleware.js"
import { getSummary } from "../controllers/dashboardController.js";


const router = express.Router()

//authmiddle will very the user, if the user is okay it will call de addEmployee to the database
router.get("/summary", authMiddleware, getSummary)




export default router;