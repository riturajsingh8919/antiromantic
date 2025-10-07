import { NextResponse } from "next/server";
import connectDB from "@/lib/connectDB";
import User from "@/models/UserModel";
import otpModel from "@/models/OTPModel";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { generateOTP } from "@/lib/helperFunctions";
import { sendMail } from "@/lib/sendMail";
import { generateOTPEmailTemplate } from "@/email/generateOTPEmailTemplate";

// Get admin users
export async function GET(request) {
  try {
    await connectDB();

    // Check authentication
    const token = request.cookies.get("auth-token")?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    let decodedToken;
    try {
      decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return NextResponse.json(
        { success: false, error: "Invalid token" },
        { status: 401 }
      );
    }

    // Check if user is admin
    const currentUser = await User.findById(decodedToken.id);
    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Admin access required" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role");

    // Build query
    const query = {};
    if (role) {
      query.role = role;
    }

    // Fetch users (exclude password)
    const users = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Create new admin user
export async function POST(request) {
  try {
    await connectDB();

    // Check authentication
    const token = request.cookies.get("auth-token")?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    let decodedToken;
    try {
      decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return NextResponse.json(
        { success: false, error: "Invalid token" },
        { status: 401 }
      );
    }

    // Check if user is admin
    const currentUser = await User.findById(decodedToken.id);
    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Admin access required" },
        { status: 403 }
      );
    }

    const { username, email, phone, password, role, isEmailVerified } =
      await request.json();

    // Validate required fields
    if (!username || !email || !phone || !password) {
      return NextResponse.json(
        { success: false, error: "All fields are required" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "Email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      username,
      email,
      phone,
      password: hashedPassword,
      role: role || "admin",
      isEmailVerified: isEmailVerified || false, // Use provided value or default to false
    });

    await newUser.save();

    // Only send OTP if email is not already verified
    if (!isEmailVerified) {
      // Generate OTP for email verification
      const otp = generateOTP();
      const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Save OTP to database
      await otpModel.create({
        email,
        otp,
        expiresAt: otpExpiry,
      });

      // Send verification email
      const emailTemplate = generateOTPEmailTemplate(otp);
      await sendMail({
        subject: "Admin Account Verification - AntiRomantic",
        receiver: email,
        body: emailTemplate,
      });
    }

    // Remove password from response
    const userResponse = newUser.toObject();
    delete userResponse.password;

    const message = isEmailVerified
      ? "Admin user created successfully with verified email."
      : "Admin user created successfully. Please check email for verification code.";

    return NextResponse.json({
      success: true,
      data: userResponse,
      message: message,
    });
  } catch (error) {
    console.error("Error creating user:", error);

    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map(
        (err) => err.message
      );
      return NextResponse.json(
        { success: false, error: validationErrors.join(", ") },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
