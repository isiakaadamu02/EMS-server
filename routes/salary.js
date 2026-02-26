import express from "express"
import authMiddleware from "../middleware/authMiddleware.js"
import { addSalary, getSalary } from "../controllers/salaryController.js";


const router = express.Router()

//authmiddle will very the user, if the user is okay it will call de addEmployee to the database
router.post("/add", authMiddleware, addSalary)
router.get("/:id/:role", authMiddleware, getSalary)



export default router;