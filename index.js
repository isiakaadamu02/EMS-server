import express from 'express';
import cors from 'cors';
import authRouter from "./routes/auth.js"
import connectToDatabase from './db/db.js';
import departmentRouter from "./routes/department.js"
import employeeRouter from "./routes/employee.js"
import salaryRouter from "./routes/salary.js"
import leaveRouter from "./routes/leave.js"
import settingRouter from "./routes/setting.js"
import dashboardRouter from "./routes/dashboard.js"

connectToDatabase(); //connect to database
const app = express()    //create express app
app.use(cors({
    origin: "https://ems-frontend-silk.vercel.app/",
    credentials: true
}));
app.use(express.json());   //middleware to parse JSON request bodies(passing data to node js file to json format)
app.use(express.static("public/uploads"))

// ✅ Add logging middleware to see all requests
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});

app.use("/api/auth", authRouter) //route link for all auth related routes
app.use("/api/department", departmentRouter) //route link for all department related routes
app.use("/api/employee", employeeRouter)
app.use("/api/salary", salaryRouter)
app.use("/api/leave", leaveRouter)
app.use("/api/setting", settingRouter)
app.use("/api/dashboard", dashboardRouter)

// mongoose.connect("mongodb://localhost:27017/crud")

// const UserSchema = new mongoose.Schema({
//     name: String,
//     age: Number
// })

// const UserModel = mongoose.model("Users", UserSchema);

// app.get("/", (req, resp) => {
//     UserModel.find({}).then(function(users) {
//         resp.json(users)
//     }).catch(function(err) {
//         console.log(err)
//     })
// })


//to run the server, we need to listen on a port
app.listen(process.env.PORT, () => {console.log(`server is running on port ${process.env.PORT}`), console.log('Department routes registered'),  console.log('  - /api/auth'),
    console.log('  - /api/department')})

//ignore for package.json
// "type": "commonjs",