import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import ProductInner from "@/models/ProductInner";
import Product from "@/models/Product";

// GET product inner items for a specific product (public endpoint)
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json(
        { success: false, error: "Product ID is required" },
        { status: 400 }
      );
    }

    // Fetch only active items for the specific product, sorted by order
    const productInners = await ProductInner.find({
      productId: productId,
      isActive: true,
    })
      .sort({ order: 1, createdAt: -1 })
      .select("-createdAt -updatedAt -__v"); // Exclude unnecessary fields

    return NextResponse.json({
      success: true,
      data: productInners,
    });
  } catch (error) {
    console.error("Error fetching product inner items:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch product inner items" },
      { status: 500 }
    );
  }
}
