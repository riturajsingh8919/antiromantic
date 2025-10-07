import connectDB from "@/lib/connectDB";
import Coupon from "@/models/Coupon";
import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

// GET - Fetch all coupons with pagination and filters
export async function GET(request) {
  try {
    const user = verifyToken(request);
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized access" },
        { status: 401 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status");

    // Build filter query
    const filter = {};
    if (search) {
      filter.$or = [
        { couponCode: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }
    if (status !== null && status !== "") {
      filter.status = status === "true";
    }

    const skip = (page - 1) * limit;

    const [coupons, totalCount] = await Promise.all([
      Coupon.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Coupon.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      success: true,
      data: {
        coupons,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching coupons:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch coupons" },
      { status: 500 }
    );
  }
}

// POST - Create a new coupon
export async function POST(request) {
  try {
    const user = verifyToken(request);
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized access" },
        { status: 401 }
      );
    }

    await connectDB();

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

    // Validate required fields
    if (
      !couponCode ||
      !discountType ||
      !discountValue ||
      !startDate ||
      !endDate
    ) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end <= start) {
      return NextResponse.json(
        { success: false, message: "End date must be after start date" },
        { status: 400 }
      );
    }

    // Validate discount value
    if (
      discountType === "percentage" &&
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

    if (discountType === "amount" && discountValue <= 0) {
      return NextResponse.json(
        { success: false, message: "Amount discount must be greater than 0" },
        { status: 400 }
      );
    }

    // Check if coupon code already exists
    const existingCoupon = await Coupon.findOne({
      couponCode: couponCode.toUpperCase(),
    });

    if (existingCoupon) {
      return NextResponse.json(
        { success: false, message: "Coupon code already exists" },
        { status: 400 }
      );
    }

    // Create new coupon
    const newCoupon = new Coupon({
      couponCode: couponCode.toUpperCase(),
      discountType,
      discountValue: parseFloat(discountValue),
      status: status !== undefined ? status : true,
      startDate: start,
      endDate: end,
      usageLimit: usageLimit ? parseInt(usageLimit) : null,
      perUserLimit: perUserLimit ? parseInt(perUserLimit) : null,
      description: description || "",
    });

    await newCoupon.save();

    return NextResponse.json(
      {
        success: true,
        message: "Coupon created successfully",
        data: newCoupon,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating coupon:", error);

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
      { success: false, message: "Failed to create coupon" },
      { status: 500 }
    );
  }
}
