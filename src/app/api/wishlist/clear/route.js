import { NextResponse } from "next/server";
import connectDB from "@/lib/connectDB";
import UserModel from "@/models/UserModel";
import { getCurrentUser } from "@/lib/auth";

// DELETE - Clear entire wishlist
export async function DELETE(request) {
  try {
    await connectDB();

    const user = getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    // Find user and clear wishlist
    const userDoc = await UserModel.findById(user.id);
    if (!userDoc) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Initialize or clear wishlist
    userDoc.wishlist = [];
    await userDoc.save();

    return NextResponse.json({
      success: true,
      message: "Wishlist cleared successfully",
    });
  } catch (error) {
    console.error("Error clearing wishlist:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
