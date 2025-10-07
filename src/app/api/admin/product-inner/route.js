import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import ProductInner from "@/models/ProductInner";
import Product from "@/models/Product";

// GET all product inner items
export async function GET(request) {
  try {
    console.log("Attempting to connect to database...");
    await connectDB();
    console.log("Database connected successfully");

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const type = searchParams.get("type");
    const isActive = searchParams.get("isActive");
    const productId = searchParams.get("productId");

    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {};
    if (type) filter.type = type;
    if (isActive !== null && isActive !== undefined && isActive !== "") {
      filter.isActive = isActive === "true";
    }
    if (productId) filter.productId = productId;

    console.log("ProductInner model:", ProductInner);
    console.log("Applied filter:", filter);

    const [productInners, total] = await Promise.all([
      ProductInner.find(filter)
        .populate("productId", "name")
        .sort({ order: 1, createdAt: -1 })
        .skip(skip)
        .limit(limit),
      ProductInner.countDocuments(filter),
    ]);

    console.log("Fetched product inners count:", productInners.length);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: productInners,
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
    console.error("Error fetching product inner items:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch product inner items",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// POST create new product inner item
export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();

    // Basic validation
    if (!body.type) {
      return NextResponse.json(
        {
          success: false,
          error: "Type is required",
        },
        { status: 400 }
      );
    }

    if (!body.productId) {
      return NextResponse.json(
        {
          success: false,
          error: "Product ID is required",
        },
        { status: 400 }
      );
    }

    // Type-specific validation
    if (body.type === "image" && (!body.images || body.images.length === 0)) {
      return NextResponse.json(
        {
          success: false,
          error: "At least one image is required for image type",
        },
        { status: 400 }
      );
    }

    if (body.type === "video" && (!body.videos || body.videos.length === 0)) {
      return NextResponse.json(
        {
          success: false,
          error: "At least one video is required for video type",
        },
        { status: 400 }
      );
    }

    if (body.type === "text" && !body.description) {
      return NextResponse.json(
        {
          success: false,
          error: "Description is required for text type",
        },
        { status: 400 }
      );
    }

    // Set default order if not provided
    if (!body.order) {
      const lastItem = await ProductInner.findOne().sort({ order: -1 });
      body.order = lastItem ? lastItem.order + 1 : 1;
    }

    console.log(
      "Creating ProductInner with body:",
      JSON.stringify(body, null, 2)
    );

    const productInner = new ProductInner(body);
    await productInner.save();

    return NextResponse.json(
      { success: true, data: productInner },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating product inner item:", error);

    if (error.name === "ValidationError") {
      console.log("Validation error details:", error.errors);
      const errorMessages = Object.keys(error.errors).map((key) => ({
        field: key,
        message: error.errors[key].message,
      }));
      return NextResponse.json(
        {
          success: false,
          error: "Validation error",
          details: error.errors,
          messages: errorMessages,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to create product inner item" },
      { status: 500 }
    );
  }
}

// PUT update product inner item order (bulk reorder)
export async function PUT(request) {
  try {
    await connectDB();
    const { items } = await request.json();

    if (!Array.isArray(items)) {
      return NextResponse.json(
        { success: false, error: "Items must be an array" },
        { status: 400 }
      );
    }

    // Update order for each item
    const updatePromises = items.map((item, index) =>
      ProductInner.findByIdAndUpdate(item._id, { order: index + 1 })
    );

    await Promise.all(updatePromises);

    return NextResponse.json({
      success: true,
      message: "Order updated successfully",
    });
  } catch (error) {
    console.error("Error updating product inner items order:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update order" },
      { status: 500 }
    );
  }
}
