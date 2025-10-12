import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import connectDB from "@/lib/mongodb";
import ProductImageManager from "@/models/ProductImageManager";
import Product from "@/models/Product";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// GET all product image managers with pagination and filtering
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const productId = searchParams.get("productId");
    const isActive = searchParams.get("isActive");

    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {};
    if (productId) filter.productId = productId;
    if (isActive !== null && isActive !== undefined && isActive !== "") {
      filter.isActive = isActive === "true";
    }

    const [productImageManagers, total] = await Promise.all([
      ProductImageManager.find(filter)
        .populate("productId", "name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      ProductImageManager.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: productImageManagers,
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
    console.error("Error fetching product image managers:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch product image managers" },
      { status: 500 }
    );
  }
}

// POST - Create new product image manager
export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();

    // Basic validation
    if (!body.productId) {
      return NextResponse.json(
        { success: false, error: "Product ID is required" },
        { status: 400 }
      );
    }

    if (!body.normalImage || !body.hoverImage) {
      return NextResponse.json(
        { success: false, error: "Both normal and hover images are required" },
        { status: 400 }
      );
    }

    // Check if product exists
    const product = await Product.findById(body.productId);
    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    // Check if product image manager already exists
    const existingImageManager = await ProductImageManager.findOne({
      productId: body.productId,
    });

    if (existingImageManager) {
      return NextResponse.json(
        {
          success: false,
          error: "Product image manager already exists. Use PUT to update.",
        },
        { status: 409 }
      );
    }

    // Create new product image manager
    const productImageManager = new ProductImageManager({
      productId: body.productId,
      normalImage: body.normalImage,
      hoverImage: body.hoverImage,
      isActive: body.isActive !== undefined ? body.isActive : true,
    });

    await productImageManager.save();

    // Populate the product information
    await productImageManager.populate("productId", "name");

    return NextResponse.json({
      success: true,
      data: productImageManager,
      message: "Product image manager created successfully",
    });
  } catch (error) {
    console.error("Error creating product image manager:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create product image manager" },
      { status: 500 }
    );
  }
}

// PUT - Update existing product image manager
export async function PUT(request) {
  try {
    await connectDB();

    const body = await request.json();

    if (!body._id) {
      return NextResponse.json(
        { success: false, error: "Product image manager ID is required" },
        { status: 400 }
      );
    }

    // Find the existing product image manager
    const productImageManager = await ProductImageManager.findById(body._id);

    if (!productImageManager) {
      return NextResponse.json(
        { success: false, error: "Product image manager not found" },
        { status: 404 }
      );
    }

    // If images are being updated, delete old ones from Cloudinary
    if (
      body.normalImage &&
      body.normalImage.publicId !== productImageManager.normalImage.publicId
    ) {
      try {
        await cloudinary.uploader.destroy(
          productImageManager.normalImage.publicId
        );
      } catch (deleteError) {
        console.warn(
          "Warning: Failed to delete old normal image from Cloudinary:",
          deleteError
        );
      }
    }

    if (
      body.hoverImage &&
      body.hoverImage.publicId !== productImageManager.hoverImage.publicId
    ) {
      try {
        await cloudinary.uploader.destroy(
          productImageManager.hoverImage.publicId
        );
      } catch (deleteError) {
        console.warn(
          "Warning: Failed to delete old hover image from Cloudinary:",
          deleteError
        );
      }
    }

    // Update the fields
    if (body.normalImage) productImageManager.normalImage = body.normalImage;
    if (body.hoverImage) productImageManager.hoverImage = body.hoverImage;
    if (body.isActive !== undefined)
      productImageManager.isActive = body.isActive;

    await productImageManager.save();

    // Populate the product information
    await productImageManager.populate("productId", "name");

    return NextResponse.json({
      success: true,
      data: productImageManager,
      message: "Product image manager updated successfully",
    });
  } catch (error) {
    console.error("Error updating product image manager:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update product image manager" },
      { status: 500 }
    );
  }
}
