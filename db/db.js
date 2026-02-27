 //creating connection with mongodb database
 import mongoose from "mongoose";

 let isConnected = false; // Track connection status

  const connectToDatabase = async () => {
     // Prevent multiple connections in serverless
    if (isConnected) {
        console.log("Using existing database connection");
        return;
    }
    try {
        await mongoose.connect(process.env.MONGODB_URL)
        // await mongoose.connect(process.env.MONGODB_URL, {
        //     serverSelectionTimeoutMS: 5000,
        //     socketTimeoutMS: 45000,
        // });
        
        isConnected = true;
        console.log("Database connected successfully");
    }catch(error) {
        console.log(error)
        console.error(" Database connection error:", error);
        throw error;
    }
  } 

  export default connectToDatabase;



//   import mongoose from "mongoose";

//   const connectToDatabase = async () => {
//     try {
//         await mongoose.connect(process.env.MONGODB_URL)
//     }catch(error) {
//         console.log(error)
//     }
//   } 

//   export default connectToDatabase;