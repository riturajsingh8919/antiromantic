import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";

// GET all products with pagination and filtering
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const status = searchParams.get("status");
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const featured = searchParams.get("featured");

    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {};
    if (status) filter.status = status;
    if (category && category !== "all") filter.category = category;
    if (featured === "true") filter.isFeatured = true;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { colorName: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }

    const [products, total] = await Promise.all([
      Product.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Product.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: products,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

// POST create new product
export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();

    // Basic validation
    if (!body.name || !body.price || !body.category || !body.colorName) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: name, price, category, or colorName",
        },
        { status: 400 }
      );
    }

    // Check if product with same name or slug exists
    const existingProduct = await Product.findOne({
      $or: [{ name: body.name }, { slug: body.slug }],
    });

    if (existingProduct) {
      return NextResponse.json(
        {
          success: false,
          error: "Product with this name or slug already exists",
        },
        { status: 400 }
      );
    }

    // Filter out invalid images (those without url or publicId)
    if (body.images && Array.isArray(body.images)) {
      body.images = body.images.filter((img) => img && img.url && img.publicId);
    }

    const product = new Product(body);
    await product.save();

    return NextResponse.json({ success: true, data: product }, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);

    if (error.name === "ValidationError") {
      return NextResponse.json(
        { success: false, error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to create product" },
      { status: 500 }
    );
  }
}
