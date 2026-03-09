import dotenv from 'dotenv';
import Attendance from "../models/Attendance.js";
import connectToDatabase from "../db/db.js";

// ✅ Load environment variables first
dotenv.config();

const cleanupDuplicates = async () => {
    try {
        await connectToDatabase();
        
        console.log("🔍 Finding duplicate attendance records...");
        
        // Find all attendance records
        const allRecords = await Attendance.find({}).sort({ date: -1, createdAt: 1 });
        
        const seen = new Set();
        const duplicates = [];
        
        for (const record of allRecords) {
            const key = `${record.employeeId}_${new Date(record.date).toISOString().split('T')[0]}`;
            
            if (seen.has(key)) {
                duplicates.push(record._id);
                console.log(`❌ Duplicate found: Employee ${record.employeeId} on ${new Date(record.date).toLocaleDateString()}`);
            } else {
                seen.add(key);
            }
        }
        
        if (duplicates.length > 0) {
            console.log(`\n🗑️ Deleting ${duplicates.length} duplicate records...`);
            await Attendance.deleteMany({ _id: { $in: duplicates } });
            console.log("✅ Duplicates removed!");
        } else {
            console.log("✅ No duplicates found!");
        }
        
        process.exit(0);
    } catch (error) {
        console.error("❌ Error:", error);
        process.exit(1);
    }
}

cleanupDuplicates();