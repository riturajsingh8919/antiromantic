import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";

// GET all categories with product counts (public endpoint)
export async function GET() {
  try {
    await connectDB();

    // Get distinct categories from active products with stock
    const categories = await Product.aggregate([
      {
        $match: {
          status: "active",
          totalStock: { $gt: 0 },
        },
      },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          key: "$_id",
          label: "$_id",
          count: 1,
        },
      },
      {
        $sort: { label: 1 },
      },
    ]);

    // Add "all" category at the beginning
    const allCount = categories.reduce((sum, cat) => sum + cat.count, 0);
    const categoriesWithAll = [
      { key: "all", label: "all", count: allCount },
      ...categories,
    ];

    return NextResponse.json({
      success: true,
      data: categoriesWithAll,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
