import { NextResponse } from "next/server";
import connectDB from "@/lib/connectDB";
import User from "@/models/UserModel";
import jwt from "jsonwebtoken";

// Get all customers with statistics
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

    // Get all users with role "user"
    const users = await User.find({ role: "user" })
      .select("-password")
      .sort({ createdAt: -1 });

    // Calculate statistics
    const totalUsers = users.length;

    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayUsers = await User.countDocuments({
      role: "user",
      createdAt: {
        $gte: today,
        $lt: tomorrow,
      },
    });

    const verifiedUsers = users.filter((user) => user.isEmailVerified).length;
    const unverifiedUsers = totalUsers - verifiedUsers;

    const statistics = {
      totalUsers,
      todayUsers,
      verifiedUsers,
      unverifiedUsers,
    };

    return NextResponse.json({
      success: true,
      data: {
        users,
        statistics,
      },
    });
  } catch (error) {
    console.error("Error fetching customers:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
