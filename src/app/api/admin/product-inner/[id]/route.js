import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import ProductInner from "@/models/ProductInner";
import Product from "@/models/Product";
import { deleteFromCloudinary } from "@/lib/cloudinary";

// GET single product inner item
export async function GET(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    const productInner = await ProductInner.findById(id).populate(
      "productId",
      "name"
    );

    if (!productInner) {
      return NextResponse.json(
        { success: false, error: "Product inner item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: productInner });
  } catch (error) {
    console.error("Error fetching product inner item:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch product inner item" },
      { status: 500 }
    );
  }
}

// PUT update product inner item
export async function PUT(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();

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

    const productInner = await ProductInner.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!productInner) {
      return NextResponse.json(
        { success: false, error: "Product inner item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: productInner });
  } catch (error) {
    console.error("Error updating product inner item:", error);

    if (error.name === "ValidationError") {
      return NextResponse.json(
        { success: false, error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to update product inner item" },
      { status: 500 }
    );
  }
}

// DELETE product inner item
export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    const productInner = await ProductInner.findById(id);

    if (!productInner) {
      return NextResponse.json(
        { success: false, error: "Product inner item not found" },
        { status: 404 }
      );
    }

    // Delete images from Cloudinary if it's an image type
    if (
      productInner.type === "image" &&
      productInner.images &&
      productInner.images.length > 0
    ) {
      try {
        // Delete all images from Cloudinary
        const deletePromises = productInner.images.map((image) =>
          image.publicId
            ? deleteFromCloudinary(image.publicId)
            : Promise.resolve()
        );
        await Promise.all(deletePromises);
      } catch (cloudinaryError) {
        console.error(
          "Error deleting images from Cloudinary:",
          cloudinaryError
        );
        // Continue with deletion even if Cloudinary fails
      }
    }

    // Delete videos from Cloudinary if it's a video type
    if (
      productInner.type === "video" &&
      productInner.videos &&
      productInner.videos.length > 0
    ) {
      try {
        // Delete all videos from Cloudinary
        const deletePromises = productInner.videos.map((video) =>
          video.publicId
            ? deleteFromCloudinary(video.publicId, "video")
            : Promise.resolve()
        );
        await Promise.all(deletePromises);
      } catch (cloudinaryError) {
        console.error(
          "Error deleting videos from Cloudinary:",
          cloudinaryError
        );
        // Continue with deletion even if Cloudinary fails
      }
    }

    await ProductInner.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Product inner item deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting product inner item:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete product inner item" },
      { status: 500 }
    );
  }
}
