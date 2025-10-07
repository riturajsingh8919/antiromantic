import { NextResponse } from "next/server";
import connectDB from "@/lib/connectDB";
import Order from "@/models/Order";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request, { params }) {
  try {
    await connectDB();

    const user = getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    const { orderNumber } = resolvedParams;

    if (!orderNumber) {
      return NextResponse.json(
        { success: false, error: "Order number is required" },
        { status: 400 }
      );
    }

    // Find order by order number and customer
    const order = await Order.findOne({
      orderNumber,
      customer: user._id || user.id,
    }).populate({
      path: "items.product",
      model: "Product",
      select: "name images slug",
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("Order lookup error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}
