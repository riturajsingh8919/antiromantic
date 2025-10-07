import { generateOTPEmailTemplate } from "@/email/generateOTPEmailTemplate";
import connectDB from "@/lib/connectDB";
import { generateOTP } from "@/lib/helperFunctions";
import { sendMail } from "@/lib/sendMail";
import { userSchema } from "@/lib/zodSchema";
import otpModel from "@/models/OTPModel";
import UserModel from "@/models/UserModel";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    await connectDB();
    const validationSchema = userSchema.pick({
      username: true,
      email: true,
      password: true,
      phone: true,
    });

    const payload = await request.json();
    const parsedData = validationSchema.safeParse(payload);

    if (!parsedData.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid or missing input fields.",
        },
        { status: 400 }
      );
    }

    const { username, email, password, phone } = parsedData.data;

    const checkUser = await UserModel.exists({ email });
    if (checkUser) {
      return NextResponse.json(
        {
          success: false,
          message: "User Already Exists",
        },
        { status: 409 }
      );
    }
    const newRegistration = new UserModel({
      username,
      email,
      phone,
      password,
    });

    await newRegistration.save();
    // otp generation
    await otpModel.deleteMany({ email });

    const otp = generateOTP();
    const newOTP = new otpModel({
      email,
      otp,
    });
    await newOTP.save();

    console.log("Attempting to send OTP to:", email);
    const otpEMailStatus = await sendMail({
      subject: "Your One Time verification Code",
      receiver: email,
      body: generateOTPEmailTemplate(otp),
    });
    console.log("Email sending result:", otpEMailStatus);

    if (!otpEMailStatus.success) {
      console.error("Email sending failed:", otpEMailStatus.message);
      return NextResponse.json({
        status: 400,
        success: false,
        message: `Failed to send OTP: ${otpEMailStatus.message}`,
      });
    }
    return NextResponse.json({
      status: 200,
      success: true,
      message: "Please verify your Email",
    });
  } catch (error) {
    console.error("Database connection failed:", error);
    return NextResponse.json(
      { error: "Database connection failed" },
      { status: 500 }
    );
  }
}
