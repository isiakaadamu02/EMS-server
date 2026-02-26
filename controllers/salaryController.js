import EmployeeModel from "../models/Employee.js";
import SalaryModel from "../models/Salary.js";

const addSalary = async (req, res) => {
    try {
        const {employeeId, basicSalary, allowances, deductions, payDate} = req.body

        console.log(" Received salary data:", req.body);

        const totalSalary = parseInt(basicSalary) + parseInt(allowances) - parseInt(deductions)

        const newSalary = new SalaryModel({
            employeeId,
            basicSalary,
            allowances,
            deductions,
            netSalary: totalSalary,
            payDate
        })

        await newSalary.save()

        return res.status(200).json({success: true})
    } catch (error) {
        console.error(" Error adding salary:", error);
        return res.status(500).json({success: false, error: "salary add server error"})
    }
}

const getSalary = async (req, res) => {
    try {
        const {id, role} = req.params;
        console.log(role, id)
        let salaries 
        if(role === "admin") {
            salaries = await SalaryModel.find({employeeId: id}).populate("employeeId", "employeeId")
        } else {
            if (!salaries || salaries.length < 1) {
            const employee = await EmployeeModel.findOne({userId: id})
            salaries = await SalaryModel.find({employeeId: employee._id}).populate("employeeId", "employeeId")
        }
        }
        
        return res.status(200).json({success: true, salaries})
    } catch (error) {
        console.error(" Error getting salary:", error);
        return res.status(500).json({success: false, error: "get salary server error"})
    }
}

export {addSalary, getSalary}