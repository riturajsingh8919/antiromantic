import { getCurrentUser } from "@/lib/auth";
import { NextResponse } from "next/server";
import connectDB from "@/lib/connectDB";
import UserModel from "@/models/UserModel";

export async function GET(request) {
  try {
    await connectDB();

    const tokenUser = getCurrentUser(request);

    if (!tokenUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Not authenticated",
        },
        { status: 401 }
      );
    }

    // Fetch full user data from database
    const user = await UserModel.findById(tokenUser.id).select("-password");

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        isEmailVerified: user.isEmailVerified,
        role: user.role,
        phone: user.phone,
        address: user.address,
        address2: user.address2,
        city: user.city,
        state: user.state,
        pincode: user.pincode,
        firstName: user.firstName,
        lastName: user.lastName,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error("Get current user error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
