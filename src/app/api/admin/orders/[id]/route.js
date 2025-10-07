import { NextResponse } from "next/server";
import connectDB from "@/lib/connectDB";
import Order from "@/models/Order";
import { getCurrentUser } from "@/lib/auth";

// GET - Fetch single order for admin
export async function GET(request, { params }) {
  try {
    await connectDB();

    const user = getCurrentUser(request);
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Admin access required" },
        { status: 403 }
      );
    }

    const resolvedParams = await params;
    const { id } = resolvedParams;

    const order = await Order.findById(id)
      .populate({
        path: "customer",
        select: "username email firstName lastName phone",
      })
      .populate({
        path: "items.product",
        select: "name images slug price",
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
    console.error("Admin order fetch error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}

// PUT - Update order status and details
export async function PUT(request, { params }) {
  try {
    await connectDB();

    const user = getCurrentUser(request);
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Admin access required" },
        { status: 403 }
      );
    }

    const resolvedParams = await params;
    const { id } = resolvedParams;
    const body = await request.json();

    const {
      status,
      paymentStatus,
      fulfillmentStatus,
      trackingNumber,
      notes,
      shippingMethod,
    } = body;

    const updateData = {};

    // Update allowed fields
    if (status) updateData.status = status;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;
    if (fulfillmentStatus) updateData.fulfillmentStatus = fulfillmentStatus;
    if (trackingNumber !== undefined)
      updateData.trackingNumber = trackingNumber;
    if (notes !== undefined) updateData.notes = notes;
    if (shippingMethod) updateData.shippingMethod = shippingMethod;

    // Set timestamps based on status
    if (status === "shipped" && !updateData.shippedAt) {
      updateData.shippedAt = new Date();
    }
    if (status === "delivered" && !updateData.deliveredAt) {
      updateData.deliveredAt = new Date();
    }

    const order = await Order.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate({
        path: "customer",
        select: "username email firstName lastName phone",
      })
      .populate({
        path: "items.product",
        select: "name images slug price",
      });

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Order updated successfully",
      data: order,
    });
  } catch (error) {
    console.error("Admin order update error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update order" },
      { status: 500 }
    );
  }
}

// DELETE - Delete order (soft delete or hard delete)
export async function DELETE(request, { params }) {
  try {
    await connectDB();

    const user = getCurrentUser(request);
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Admin access required" },
        { status: 403 }
      );
    }

    const resolvedParams = await params;
    const { id } = resolvedParams;

    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    // Check if order can be deleted (prevent deletion of completed orders)
    if (order.status === "delivered" && order.paymentStatus === "paid") {
      return NextResponse.json(
        {
          success: false,
          error: "Cannot delete delivered and paid orders",
        },
        { status: 400 }
      );
    }

    await Order.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Order deleted successfully",
    });
  } catch (error) {
    console.error("Admin order delete error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete order" },
      { status: 500 }
    );
  }
}
