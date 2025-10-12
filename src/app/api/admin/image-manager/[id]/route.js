import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import connectDB from "@/lib/mongodb";
import ProductImageManager from "@/models/ProductImageManager";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// DELETE - Remove product image manager
export async function DELETE(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Product image manager ID is required" },
        { status: 400 }
      );
    }

    // Find the product image manager
    const productImageManager = await ProductImageManager.findById(id);

    if (!productImageManager) {
      return NextResponse.json(
        { success: false, error: "Product image manager not found" },
        { status: 404 }
      );
    }

    // Delete images from Cloudinary
    const deletePromises = [];

    if (productImageManager.normalImage?.publicId) {
      deletePromises.push(
        cloudinary.uploader.destroy(productImageManager.normalImage.publicId)
      );
    }

    if (productImageManager.hoverImage?.publicId) {
      deletePromises.push(
        cloudinary.uploader.destroy(productImageManager.hoverImage.publicId)
      );
    }

    // Wait for all deletions to complete (but don't fail if some don't delete)
    await Promise.allSettled(deletePromises);

    // Delete from database
    await ProductImageManager.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Product image manager deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting product image manager:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete product image manager" },
      { status: 500 }
    );
  }
}
