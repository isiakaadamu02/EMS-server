
import UserModel from "./models/User.js";
import connectToDatabase from "./db/db.js";
import { put } from '@vercel/blob';
import fs from 'fs';
import path from 'path';

const migrateToBlob = async () => {
    try {
        await connectToDatabase();
        
        const users = await UserModel.find({ 
            profileImage: { $ne: "" } 
        });
        
        console.log(`📊 Found ${users.length} users with images`);
        
        for (const user of users) {
            // Skip if already a full URL
            if (user.profileImage.startsWith('http')) {
                console.log(`⏭️  ${user.name} already has URL, skipping`);
                continue;
            }
            
            // Read old file from local storage
            const oldPath = path.join('public/uploads', user.profileImage);
            
            if (fs.existsSync(oldPath)) {
                const fileBuffer = fs.readFileSync(oldPath);
                
                // Upload to Vercel Blob
                const blob = await put(
                    `employee-images/${user.profileImage}`,
                    fileBuffer,
                    {
                        access: 'public',
                        token: process.env.BLOB_READ_WRITE_TOKEN,
                    }
                );
                
                user.profileImage = blob.url;
                await user.save();
                
                console.log(`✅ Migrated ${user.name}: ${blob.url}`);
            } else {
                console.log(`❌ File not found for ${user.name}: ${oldPath}`);
            }
        }
        
        console.log("✅ Migration complete!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Error:", error);
        process.exit(1);
    }
}

migrateToBlob();