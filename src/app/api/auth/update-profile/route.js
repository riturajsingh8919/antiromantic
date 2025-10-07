import { NextResponse } from "next/server";
import connectDB from "@/lib/connectDB";
import UserModel from "@/models/UserModel";
import { getCurrentUser } from "@/lib/auth";

export async function PUT(request) {
  try {
    await connectDB();
    const user = getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }
    const body = await request.json();
    const {
      firstName,
      lastName,
      phone,
      address,
      address2,
      city,
      state,
      pincode,
    } = body;
    const updatedUser = await UserModel.findByIdAndUpdate(
      user.id,
      {
        firstName,
        lastName,
        phone,
        address,
        address2,
        city,
        state,
        pincode,
        updatedAt: new Date(),
      },
      { new: true, select: "-password" }
    );
    if (!updatedUser) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
