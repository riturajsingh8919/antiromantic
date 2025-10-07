import connectDB from "@/lib/connectDB";
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

    const { email, otp, purpose } = await request.json();

    if (!email || !otp || !purpose) {
      return NextResponse.json(
        { error: "Email, OTP, and purpose are required" },
        { status: 400 }
      );
    }

    // Find the OTP record
    const otpRecord = await otpModel.findOne({
      email,
      otp,
      purpose: `admin_${purpose}`,
      expiresAt: { $gt: new Date() }, // Check if OTP is not expired
    });

    if (!otpRecord) {
      return NextResponse.json(
        { error: "Invalid or expired OTP" },
        { status: 400 }
      );
    }

    // OTP is valid - delete it (one-time use)
    await otpModel.deleteOne({ _id: otpRecord._id });

    return NextResponse.json(
      {
        success: true,
        message: "OTP verified successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error verifying admin OTP:", error);
    return NextResponse.json(
      { error: "Failed to verify OTP" },
      { status: 500 }
    );
  }
}
