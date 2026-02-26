import express from "express"
import authMiddleware from "../middleware/authMiddleware.js"
import { addDepartment, deleteDepartments, editDepartments, getDepartment, getDepartments } from "../controllers/departmentController.js"

const router = express.Router()

//authmiddle will very the user, if the user is okay it will call de addDepartment to the database
router.get("/", authMiddleware, getDepartments)
router.post("/add", authMiddleware, addDepartment)
router.get("/get/:id", authMiddleware, getDepartment)
router.put("/edit/:id", authMiddleware, editDepartments)
router.delete("/delete/:id", authMiddleware, deleteDepartments)


export default router;