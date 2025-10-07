import { NextResponse } from "next/server";
import connectDB from "@/lib/connectDB";
import UserModel from "@/models/UserModel";

export async function POST(request) {
  // Only allow this in development
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { success: false, message: "Not available in production" },
      { status: 403 }
    );
  }

  try {
    await connectDB();

    // Check if admin already exists
    const existingAdmin = await UserModel.findOne({
      email: "admin@antiromantic.com",
    });

    if (existingAdmin) {
      return NextResponse.json({
        success: false,
        message: "Admin user already exists",
      });
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

    return NextResponse.json({
      success: true,
      message: "Admin user created successfully",
      credentials: {
        email: "admin@antiromantic.com",
        password: "admin123456",
      },
    });
  } catch (error) {
    console.error("Error creating admin user:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create admin user",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
