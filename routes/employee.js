import express from "express"
import authMiddleware from "../middleware/authMiddleware.js"
import { addEmployee, fetchEmployeesByDepId, getEmployee, getEmployees, updateEmployee, upload } from "../controllers/employeeController.js"


const router = express.Router()

//authmiddle will very the user, if the user is okay it will call de addEmployee to the database
router.get("/", authMiddleware, getEmployees)
router.post("/add", authMiddleware, upload.single("image"), addEmployee)
router.get("/:id", authMiddleware, getEmployee)
router.put("/:id", authMiddleware, updateEmployee)
router.get("/department/:id", authMiddleware, fetchEmployeesByDepId)


export default router;