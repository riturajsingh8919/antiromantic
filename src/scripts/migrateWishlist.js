// Migration script to add wishlist field to existing users
// Run this once to update all existing users in the database

import connectDB from "../lib/connectDB.js";
import UserModel from "../models/UserModel.js";

async function migrateExistingUsers() {
  try {
    await connectDB();
    console.log("Connected to database...");

    // Find all users without wishlist field or with null/undefined wishlist
    const usersToUpdate = await UserModel.find({
      $or: [
        { wishlist: { $exists: false } },
        { wishlist: null },
        { wishlist: undefined },
      ],
    });

    console.log(`Found ${usersToUpdate.length} users to update...`);

    // Update each user with empty wishlist array
    for (const user of usersToUpdate) {
      user.wishlist = [];
      await user.save();
      console.log(`Updated user: ${user.email}`);
    }

    console.log("Migration completed successfully!");
    console.log(`Updated ${usersToUpdate.length} users with wishlist field.`);
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    process.exit(0);
  }
}

// Uncomment the line below and run: node src/scripts/migrateWishlist.js
// migrateExistingUsers();
