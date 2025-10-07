import { NextResponse } from "next/server";
import connectDB from "@/lib/connectDB";
import UserModel from "@/models/UserModel";
import bcrypt from "bcryptjs";

export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();
    const { email, newPassword, confirmPassword, step } = body;

    if (step === "check-email") {
      // Step 1: Check if user exists with this email
      const user = await UserModel.findOne({ email });

      if (!user) {
        return NextResponse.json(
          { success: false, message: "No user found with this email address" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "User found. You can now reset your password.",
        userExists: true,
      });
    }

    if (step === "reset-password") {
      // Step 2: Reset the password
      if (!newPassword || !confirmPassword) {
        return NextResponse.json(
          {
            success: false,
            message: "Please provide both new password and confirm password",
          },
          { status: 400 }
        );
      }

      if (newPassword !== confirmPassword) {
        return NextResponse.json(
          { success: false, message: "Passwords do not match" },
          { status: 400 }
        );
      }

      if (newPassword.length < 6) {
        return NextResponse.json(
          {
            success: false,
            message: "Password must be at least 6 characters long",
          },
          { status: 400 }
        );
      }

      // Find user and update password
      const user = await UserModel.findOne({ email });

      if (!user) {
        return NextResponse.json(
          { success: false, message: "User not found" },
          { status: 404 }
        );
      }

      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update user password
      await UserModel.findByIdAndUpdate(user._id, {
        password: hashedPassword,
        updatedAt: new Date(),
      });

      return NextResponse.json({
        success: true,
        message:
          "Password reset successfully. You can now login with your new password.",
      });
    }

    return NextResponse.json(
      { success: false, message: "Invalid step provided" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
