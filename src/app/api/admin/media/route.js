import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// GET all media (images and videos) from Cloudinary
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const folder = searchParams.get("folder");
    const limit = parseInt(searchParams.get("limit")) || 100;
    const nextCursor = searchParams.get("next_cursor");
    const resourceType = searchParams.get("resource_type") || "auto"; // auto, image, video

    let expression = "";
    if (resourceType === "image") {
      expression = "resource_type:image";
    } else if (resourceType === "video") {
      expression = "resource_type:video";
    } else {
      // Get both images and videos
      expression = "resource_type:image OR resource_type:video";
    }

    if (folder && folder !== "all") {
      expression += ` AND folder:${folder}`;
    }

    const result = await cloudinary.search
      .expression(expression)
      .sort_by("created_at", "desc")
      .max_results(limit)
      .execute();

    return NextResponse.json({
      success: true,
      data: result.resources,
      next_cursor: result.next_cursor,
      total_count: result.total_count,
    });
  } catch (error) {
    console.error("Error fetching images from Cloudinary:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch images" },
      { status: 500 }
    );
  }
}
