// migrate-to-blob.js
import UserModel from "./models/User.js";
import connectToDatabase from "./db/db.js";
import { put } from '@vercel/blob';
import dotenv from 'dotenv';

dotenv.config();

const migrateToBlob = async () => {
    try {
        if (!process.env.MONGODB_URL) {
            console.error("❌ MONGODB_URL not found in .env file!");
            process.exit(1);
        }
        
        if (!process.env.BLOB_READ_WRITE_TOKEN) {
            console.error("❌ BLOB_READ_WRITE_TOKEN not found!");
            process.exit(1);
        }
        
        await connectToDatabase();
        
        // ✅ Find users with non-empty profileImage OR undefined
        const users = await UserModel.find({});
        
        console.log(`\n📊 Found ${users.length} total users\n`);
        
        for (const user of users) {
            console.log(`\n👤 Processing: ${user.name}`);
            console.log(`   Current image: ${user.profileImage || 'EMPTY'}`);
            
            // ✅ Skip if already has a valid URL
            if (user.profileImage && user.profileImage.startsWith('http')) {
                console.log(`   ✅ Already has full URL, skipping`);
                continue;
            }
            
            // ✅ For undefined, empty, or filename - set placeholder
            const placeholderUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&size=500&background=random&color=fff&bold=true`;
            
            user.profileImage = placeholderUrl;
            await user.save();
            
            console.log(`   ✅ Updated to placeholder`);
        }
        
        console.log("\n✅ Migration complete!");
        console.log("⚠️  All users now have placeholder avatars.\n");
        process.exit(0);
    } catch (error) {
        console.error("❌ Error:", error);
        process.exit(1);
    }
}

migrateToBlob();