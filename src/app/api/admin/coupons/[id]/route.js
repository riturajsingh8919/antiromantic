import connectDB from "@/lib/connectDB";
import Coupon from "@/models/Coupon";
import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

// GET - Fetch single coupon by ID
export async function GET(request, { params }) {
  try {
    const user = verifyToken(request);
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized access" },
        { status: 401 }
      );
    }

    await connectDB();
    const { id } = await params;

    const coupon = await Coupon.findById(id);
    if (!coupon) {
      return NextResponse.json(
        { success: false, message: "Coupon not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: coupon,
    });
  } catch (error) {
    console.error("Error fetching coupon:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch coupon" },
      { status: 500 }
    );
  }
}

// PUT - Update coupon
export async function PUT(request, { params }) {
  try {
    const user = verifyToken(request);
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized access" },
        { status: 401 }
      );
    }

    await connectDB();
    const { id } = await params;
    const body = await request.json();

    const {
      couponCode,
      discountType,
      discountValue,
      status,
      startDate,
      endDate,
      usageLimit,
      perUserLimit,
      description,
    } = body;

    // Find the coupon
    const coupon = await Coupon.findById(id);
    if (!coupon) {
      return NextResponse.json(
        { success: false, message: "Coupon not found" },
        { status: 404 }
      );
    }

    // Validate dates if provided
    const finalStartDate = startDate ? new Date(startDate) : coupon.startDate;
    const finalEndDate = endDate ? new Date(endDate) : coupon.endDate;

    if (finalEndDate <= finalStartDate) {
      return NextResponse.json(
        { success: false, message: "End date must be after start date" },
        { status: 400 }
      );
    }

    // Validate discount value if provided
    if (
      discountType === "percentage" &&
      discountValue &&
      (discountValue <= 0 || discountValue > 100)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Percentage discount must be between 1 and 100",
        },
        { status: 400 }
      );
    }

    if (discountType === "amount" && discountValue && discountValue <= 0) {
      return NextResponse.json(
        { success: false, message: "Amount discount must be greater than 0" },
        { status: 400 }
      );
    }

    // Check if coupon code is being changed and if it already exists
    if (couponCode && couponCode.toUpperCase() !== coupon.couponCode) {
      const existingCoupon = await Coupon.findOne({
        couponCode: couponCode.toUpperCase(),
        _id: { $ne: id },
      });

      if (existingCoupon) {
        return NextResponse.json(
          { success: false, message: "Coupon code already exists" },
          { status: 400 }
        );
      }
    }

    // Update fields
    const updateData = {};
    if (couponCode !== undefined)
      updateData.couponCode = couponCode.toUpperCase();
    if (discountType !== undefined) updateData.discountType = discountType;
    if (discountValue !== undefined)
      updateData.discountValue = parseFloat(discountValue);
    if (status !== undefined) updateData.status = status;
    if (startDate !== undefined) updateData.startDate = new Date(startDate);
    if (endDate !== undefined) updateData.endDate = new Date(endDate);
    if (usageLimit !== undefined)
      updateData.usageLimit = usageLimit ? parseInt(usageLimit) : null;
    if (perUserLimit !== undefined)
      updateData.perUserLimit = perUserLimit ? parseInt(perUserLimit) : null;
    if (description !== undefined) updateData.description = description;

    const updatedCoupon = await Coupon.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    return NextResponse.json({
      success: true,
      message: "Coupon updated successfully",
      data: updatedCoupon,
    });
  } catch (error) {
    console.error("Error updating coupon:", error);

    if (error.name === "ValidationError") {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 400 }
      );
    }

    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, message: "Coupon code already exists" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Failed to update coupon" },
      { status: 500 }
    );
  }
}

// DELETE - Delete coupon
export async function DELETE(request, { params }) {
  try {
    const user = verifyToken(request);
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized access" },
        { status: 401 }
      );
    }

    await connectDB();
    const { id } = await params;

    const coupon = await Coupon.findById(id);
    if (!coupon) {
      return NextResponse.json(
        { success: false, message: "Coupon not found" },
        { status: 404 }
      );
    }

    await Coupon.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Coupon deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting coupon:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete coupon" },
      { status: 500 }
    );
  }
}
