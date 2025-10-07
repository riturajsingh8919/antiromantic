import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// GET all images from Cloudinary
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const folder = searchParams.get("folder");
    const limit = parseInt(searchParams.get("limit")) || 100;
    const nextCursor = searchParams.get("next_cursor");

    const searchOptions = {
      resource_type: "image",
      max_results: limit,
      sort_by: [["created_at", "desc"]],
    };

    if (folder && folder !== "all") {
      searchOptions.folder = folder;
    }

    if (nextCursor) {
      searchOptions.next_cursor = nextCursor;
    }

    const result = await cloudinary.search
      .expression("resource_type:image")
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
