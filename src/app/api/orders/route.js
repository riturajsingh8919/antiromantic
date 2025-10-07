import { NextResponse } from "next/server";
import connectDB from "@/lib/connectDB";
import Order from "@/models/Order";
import Product from "@/models/Product";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request) {
  try {
    await connectDB();

    const user = getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    console.log("Fetching orders for user:", user.id);

    // Find all orders for the user
    const orders = await Order.find({
      customer: user.id,
    }).sort({ createdAt: -1 }); // Most recent first

    console.log("Found orders:", orders.length);

    return NextResponse.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error("Orders fetch error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
