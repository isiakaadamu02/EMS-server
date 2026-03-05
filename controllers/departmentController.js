import DepartmentModel from "../models/Department.js";


const getDepartments = async (req, res) => {
    try {
        const departments = await DepartmentModel.find(); // Find all departments in the database
        return res.status(200).json({success: true, departments}) // Return the list of departments
    } catch (error) {
        console.error("Error fetching departments:", error);
        return res.status(500).json({ error: "Get departments server error" });
    }
}

const addDepartment = async (req, res) => {
     console.log(" addDepartment controller hit") 
    console.log("Request body:", req.body) 
    try {
        const {dep_name, description} = req.body; //get department name and description from request body
        const newDept = new DepartmentModel({
            dep_name,
            description
        })
        await newDept.save(); //save the new department to the database
        return res.status(200).json({success: true, department: newDept}); //return success response with the new department data
    } catch (error) {
        return res.status(500).json({ error: "Add department server error" });
    }
}

const getDepartment = async (req, res) => {
    try {
        const {id} = req.params; //get the department id from request parameters
        const department = await DepartmentModel.findById({_id: id}) //find the department by id in the database
        return res.status(200).json({success: true, department})
    } catch (error) {
         console.error("Error fetching departments:", error);
        return res.status(500).json({ error: "Get departments server error" });
    }
}

const editDepartments = async (req, res) => {
    try {
        const {id} = req.params; //get the department id from request parameters
        const {dep_name, description} = req.body; //get department name and description from request body
        const updatedDepartment = await DepartmentModel.findByIdAndUpdate(
            {_id: id},
            {dep_name, description},
            {new: true} //return the updated document
        )
        return res.status(200).json({success: true, department: updatedDepartment})
    } catch (error) {
        console.error("Error updating department:", error);
        return res.status(500).json({ success: false, error: "Edit department server error" });
    }
}

const deleteDepartments = async (req, res) => {
  try {
        const {id} = req.params; //get department id from request parameters
        //find and delete the department by id
        const deleteDepartment = await DepartmentModel.findById(id);

        if (!deleteDepartment) {
            return res.status(404).json({ 
                success: false, 
                error: "Department not found" 
            });
        }
        console.log("Found deleteDepartment:", deleteDepartment.dep_name);

        // when it is called it will trigger the middleware in department model, where it deletes everything associated with the dept
        await deleteDepartment.deleteOne()
        return res.status(200).json({success: true, department: deleteDepartment})
    } catch (error) {
        console.error("Error deleting department:", error);
        return res.status(500).json({ success: false, error: "Delete department server error" });
    }
}
      

export {addDepartment, getDepartments, getDepartment, editDepartments, deleteDepartments}