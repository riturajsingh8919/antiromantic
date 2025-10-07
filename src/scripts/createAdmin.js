import connectDB from "@/lib/connectDB";
import UserModel from "@/models/UserModel";
import bcrypt from "bcryptjs";

async function createAdminUser() {
  try {
    await connectDB();

    // Check if admin already exists
    const existingAdmin = await UserModel.findOne({
      email: "admin@antiromantic.com",
    });

    if (existingAdmin) {
      console.log("Admin user already exists");
      return;
    }

    // Create admin user
    const adminUser = new UserModel({
      username: "Admin User",
      email: "admin@antiromantic.com",
      password: "admin123456", // This will be hashed by the pre-save hook
      phone: "9876543210",
      role: "admin",
      isEmailVerified: true,
      address: "Admin Office, Mumbai, India",
    });

    await adminUser.save();
    console.log("Admin user created successfully");
    console.log("Email: admin@antiromantic.com");
    console.log("Password: admin123456");
  } catch (error) {
    console.error("Error creating admin user:", error);
  }
}

// Uncomment this line to create admin user
// createAdminUser();

export { createAdminUser };
