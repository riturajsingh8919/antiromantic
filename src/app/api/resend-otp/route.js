import connectDB from "@/lib/connectDB";
import { generateOTP } from "@/lib/helperFunctions";
import { sendMail } from "@/lib/sendMail";
import { generateOTPEmailTemplate } from "@/email/generateOTPEmailTemplate";
import otpModel from "@/models/OTPModel";
import UserModel from "@/models/UserModel";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    await connectDB();

    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        {
          success: false,
          message: "Email is required",
        },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await UserModel.findOne({ email });
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    // Check if user is already verified
    if (user.isEmailVerified) {
      return NextResponse.json(
        {
          success: false,
          message: "Email is already verified",
        },
        { status: 400 }
      );
    }

    // Check for recent OTP requests (rate limiting - 10 minutes)
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    const recentOTP = await otpModel.findOne({
      email,
      createdAt: { $gte: tenMinutesAgo },
    });

    if (recentOTP) {
      const timeLeft = Math.ceil(
        (recentOTP.createdAt.getTime() + 10 * 60 * 1000 - Date.now()) / 1000
      );
      const minutesLeft = Math.floor(timeLeft / 60);
      const secondsLeft = timeLeft % 60;

      return NextResponse.json(
        {
          success: false,
          message: `Please wait ${minutesLeft}:${secondsLeft
            .toString()
            .padStart(2, "0")} before requesting a new OTP`,
          timeLeft: timeLeft,
        },
        { status: 429 }
      );
    }

    // Delete any existing OTPs for this email
    await otpModel.deleteMany({ email });

    // Generate new OTP
    const otp = generateOTP();
    const newOTP = new otpModel({
      email,
      otp,
    });
    await newOTP.save();

    // Send email
    console.log("Attempting to resend OTP to:", email);
    const otpEMailStatus = await sendMail({
      subject: "Your New Verification Code - antiromantic",
      receiver: email,
      body: generateOTPEmailTemplate(otp),
    });
    console.log("Email sending result:", otpEMailStatus);

    if (!otpEMailStatus.success) {
      console.error("Email sending failed:", otpEMailStatus.message);
      return NextResponse.json(
        {
          success: false,
          message: `Failed to send OTP: ${otpEMailStatus.message}`,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "New OTP sent successfully",
    });
  } catch (error) {
    console.error("Resend OTP error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
