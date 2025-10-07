import { NextResponse } from "next/server";
import connectDB from "@/lib/connectDB";
import User from "@/models/UserModel";
import Order from "@/models/Order";
import jwt from "jsonwebtoken";

// Get recent notifications for admin
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

    // Get recent notifications (last 24 hours)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Get new users (last 24 hours)
    const newUsers = await User.find({
      role: "user",
      createdAt: { $gte: twentyFourHoursAgo },
    })
      .select("username email createdAt")
      .sort({ createdAt: -1 })
      .limit(10);

    // Get new orders (last 24 hours)
    const newOrders = await Order.find({
      createdAt: { $gte: twentyFourHoursAgo },
    })
      .populate("customer", "username email")
      .select("orderNumber totalAmount status createdAt customer")
      .sort({ createdAt: -1 })
      .limit(10);

    // Format notifications
    const notifications = [];

    // Add user notifications
    newUsers.forEach((user) => {
      notifications.push({
        id: `user_${user._id}`,
        type: "new_user",
        title: "New User Registration",
        message: `${user.username} has joined`,
        details: user.email,
        timestamp: user.createdAt,
        icon: "user",
      });
    });

    // Add order notifications
    newOrders.forEach((order) => {
      notifications.push({
        id: `order_${order._id}`,
        type: "new_order",
        title: "New Order",
        message: `Order #${order.orderNumber} placed`,
        details: `$${order.totalAmount} by ${
          order.customer?.username || "Unknown"
        }`,
        timestamp: order.createdAt,
        icon: "shopping-bag",
      });
    });

    // Sort all notifications by timestamp (newest first)
    notifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Get total count
    const totalCount = notifications.length;

    return NextResponse.json({
      success: true,
      data: {
        notifications: notifications.slice(0, 20), // Limit to 20 most recent
        totalCount,
        unreadCount: totalCount, // For now, consider all as unread
      },
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Mark notifications as read (for future implementation)
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

    // For future implementation: mark specific notifications as read
    // This could be enhanced to store read status in a separate collection

    return NextResponse.json({
      success: true,
      message: "Notifications marked as read",
    });
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
