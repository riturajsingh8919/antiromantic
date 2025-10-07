import { generateOTPEmailTemplate } from "@/email/generateOTPEmailTemplate";
import connectDB from "@/lib/connectDB";
import { generateOTP } from "@/lib/helperFunctions";
import { sendMail } from "@/lib/sendMail";
import otpModel from "@/models/OTPModel";
import UserModel from "@/models/UserModel";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function POST(request) {
  try {
    // Verify admin authentication
    const token = request.cookies.get("auth-token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Verify user is admin
    await connectDB();
    const currentUser = await UserModel.findById(decoded.id);
    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const { email, purpose } = await request.json();

    if (!email || !purpose) {
      return NextResponse.json(
        { error: "Email and purpose are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // For admin creation, check if email already exists
    if (purpose === "add") {
      const existingUser = await UserModel.findOne({ email });
      if (existingUser) {
        return NextResponse.json(
          { error: "User with this email already exists" },
          { status: 400 }
        );
      }
    }

    // Delete any existing OTPs for this email
    await otpModel.deleteMany({ email });

    // Generate and save OTP
    const otp = generateOTP();
    const newOTP = new otpModel({
      email,
      otp,
      purpose: `admin_${purpose}`,
    });
    await newOTP.save();

    // Send OTP email
    console.log("Attempting to send admin OTP to:", email);
    const otpEmailStatus = await sendMail({
      subject: "Admin Email Verification - One Time Code",
      receiver: email,
      body: generateOTPEmailTemplate(otp),
    });
    console.log("Admin OTP email sending result:", otpEmailStatus);

    if (!otpEmailStatus.success) {
      console.error("Admin OTP email sending failed:", otpEmailStatus.message);
      return NextResponse.json(
        {
          success: false,
          message: `Failed to send OTP: ${otpEmailStatus.message}`,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "OTP sent successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error sending admin OTP:", error);
    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
  }
}
