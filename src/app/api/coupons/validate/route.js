import connectDB from "@/lib/connectDB";
import Coupon from "@/models/Coupon";
import { NextResponse } from "next/server";

// POST - Validate coupon code and calculate discount
export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();
    const { couponCode, orderTotal, userId } = body;

    if (!couponCode || !orderTotal) {
      return NextResponse.json(
        { success: false, message: "Coupon code and order total are required" },
        { status: 400 }
      );
    }

    // Find valid coupon
    const coupon = await Coupon.findValidCoupon(couponCode);

    if (!coupon) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired coupon code" },
        { status: 400 }
      );
    }

    // Check usage limits
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return NextResponse.json(
        { success: false, message: "Coupon usage limit exceeded" },
        { status: 400 }
      );
    }

    // TODO: Check per-user limit if userId is provided
    // This would require implementing a CouponUsage model or adding usage tracking to Order model

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discountType === "percentage") {
      discountAmount = (orderTotal * coupon.discountValue) / 100;
    } else if (coupon.discountType === "amount") {
      discountAmount = Math.min(coupon.discountValue, orderTotal);
    }

    // Ensure discount doesn't exceed order total
    discountAmount = Math.min(discountAmount, orderTotal);
    const finalTotal = Math.max(0, orderTotal - discountAmount);

    return NextResponse.json({
      success: true,
      data: {
        coupon: {
          id: coupon._id,
          code: coupon.couponCode,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
          description: coupon.description,
        },
        discount: {
          amount: discountAmount,
          originalTotal: orderTotal,
          finalTotal: finalTotal,
        },
      },
    });
  } catch (error) {
    console.error("Error validating coupon:", error);
    return NextResponse.json(
      { success: false, message: "Failed to validate coupon" },
      { status: 500 }
    );
  }
}

// GET - Get coupon details by code (public endpoint for checking)
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const couponCode = searchParams.get("code");

    if (!couponCode) {
      return NextResponse.json(
        { success: false, message: "Coupon code is required" },
        { status: 400 }
      );
    }

    const coupon = await Coupon.findValidCoupon(couponCode);

    if (!coupon) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired coupon code" },
        { status: 404 }
      );
    }

    // Return limited coupon information (don't expose sensitive data)
    return NextResponse.json({
      success: true,
      data: {
        code: coupon.couponCode,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        description: coupon.description,
        endDate: coupon.endDate,
      },
    });
  } catch (error) {
    console.error("Error fetching coupon:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch coupon" },
      { status: 500 }
    );
  }
}
