import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Category from "@/models/Category";
import { categorySchema } from "@/lib/validations";

// GET all categories
export async function GET() {
  try {
    await connectDB();
    const categories = await Category.find({}).sort({
      name: 1,
    });
    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

// POST create new category
export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();

    // Validate input
    const validatedData = categorySchema.parse(body);

    // Check if category with same name or slug exists
    const existingCategory = await Category.findOne({
      $or: [{ name: validatedData.name }, { slug: validatedData.slug }],
    });

    if (existingCategory) {
      return NextResponse.json(
        {
          success: false,
          error: "Category with this name or slug already exists",
        },
        { status: 400 }
      );
    }

    const category = new Category(validatedData);
    await category.save();

    return NextResponse.json(
      { success: true, data: category },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating category:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { success: false, error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to create category" },
      { status: 500 }
    );
  }
}
