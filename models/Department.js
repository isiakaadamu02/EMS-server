import mongoose from "mongoose";
import EmployeeModel from "./Employee.js";
import LeaveModel from "./Leave.js";
import SalaryModel from "./Salary.js";

const departmentSchema = new mongoose.Schema({
    dep_name: {type: String, required: true},
    description: {type: String},
    createdAt: {type: Date, default: Date.now},
    updatedAt: {type: Date, default: Date.now}
})

//whenever the deleteOne method is called, the departmentSchema will be called
departmentSchema.pre("deleteOne", {document: true, query: false}, async function(next) {
try {
    console.log(" Cascade deleting for department:", this._id);
    //accessing the id of the department that is called
    const employees = await EmployeeModel.find({department: this._id})
    const empIds = employees.map(emp => emp._id)

    await EmployeeModel.deleteMany({department: this._id})
    await LeaveModel.deleteMany({employeeId: {$in : empIds}})
    await SalaryModel.deleteMany({employeeId: {$in : empIds}})
    next()
} catch (error) {
    next
}
})

const DepartmentModel = mongoose.model("Department", departmentSchema)
export default DepartmentModel;