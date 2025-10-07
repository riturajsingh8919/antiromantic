import connectDB from "@/lib/connectDB";
import Coupon from "@/models/Coupon";
import { NextResponse } from "next/server";

// POST - Apply coupon usage (increment usage count)
export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();
    const { couponId, userId, orderId } = body;

    if (!couponId) {
      return NextResponse.json(
        { success: false, message: "Coupon ID is required" },
        { status: 400 }
      );
    }

    // Find and update the coupon
    const coupon = await Coupon.findById(couponId);
    if (!coupon) {
      return NextResponse.json(
        { success: false, message: "Coupon not found" },
        { status: 404 }
      );
    }

    // Check if coupon has reached usage limit
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return NextResponse.json(
        { success: false, message: "Coupon usage limit exceeded" },
        { status: 400 }
      );
    }

    // Increment usage count
    await Coupon.findByIdAndUpdate(
      couponId,
      { $inc: { usedCount: 1 } },
      { new: true }
    );

    // TODO: If you want to track per-user usage limits, you can create a separate
    // CouponUsage model here to store individual usage records
    // const couponUsage = new CouponUsage({
    //   couponId,
    //   userId,
    //   orderId,
    //   usedAt: new Date()
    // });
    // await couponUsage.save();

    return NextResponse.json({
      success: true,
      message: "Coupon usage recorded successfully",
    });
  } catch (error) {
    console.error("Error recording coupon usage:", error);
    return NextResponse.json(
      { success: false, message: "Failed to record coupon usage" },
      { status: 500 }
    );
  }
}
