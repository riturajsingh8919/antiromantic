import { NextResponse } from "next/server";
import { uploadToCloudinary, deleteFromCloudinary } from "@/lib/cloudinary";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const folder = formData.get("folder") || "antiromantic";
    const resourceType = formData.get("resource_type") || "image";

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    // Define allowed types based on resource type
    let allowedTypes, maxSize, maxSizeText;

    if (resourceType === "video") {
      allowedTypes = ["video/mp4", "video/mov", "video/avi", "video/webm"];
      maxSize = 50 * 1024 * 1024; // 50MB for videos
      maxSizeText = "50MB";
    } else {
      allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
      maxSize = 5 * 1024 * 1024; // 5MB for images
      maxSizeText = "5MB";
    }

    // Check file type
    if (!allowedTypes.includes(file.type)) {
      const fileTypeError =
        resourceType === "video"
          ? "Invalid file type. Only MP4, MOV, AVI, and WebM are allowed for videos."
          : "Invalid file type. Only JPEG, PNG, and WebP are allowed for images.";

      return NextResponse.json(
        { success: false, error: fileTypeError },
        { status: 400 }
      );
    }

    // Check file size
    if (file.size > maxSize) {
      return NextResponse.json(
        {
          success: false,
          error: `File size too large. Maximum size is ${maxSizeText}.`,
        },
        { status: 400 }
      );
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;

    // Upload to Cloudinary with appropriate resource type
    const result = await uploadToCloudinary(base64, folder, resourceType);

    return NextResponse.json({
      success: true,
      data: result,
      secure_url: result.secure_url,
      public_id: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
      duration: result.duration, // For videos
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { success: false, error: `Failed to upload ${resourceType || "file"}` },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { publicId } = await request.json();

    if (!publicId) {
      return NextResponse.json(
        { success: false, error: "Public ID is required" },
        { status: 400 }
      );
    }

    const result = await deleteFromCloudinary(publicId);

    return NextResponse.json({
      success: true,
      message: "Image deleted successfully",
      data: result,
    });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete image" },
      { status: 500 }
    );
  }
}
