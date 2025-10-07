import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = async (
  file,
  folder = "antiromantic",
  resourceType = "image"
) => {
  try {
    const uploadOptions = {
      folder: folder,
      resource_type: resourceType === "video" ? "video" : "image",
    };

    // Apply transformations only for images
    if (resourceType !== "video") {
      uploadOptions.transformation = [
        { width: 800, height: 800, crop: "limit", quality: "auto" },
        { fetch_format: "auto" },
      ];
    }

    const result = await cloudinary.uploader.upload(file, uploadOptions);

    const response = {
      secure_url: result.secure_url,
      public_id: result.public_id,
      url: result.secure_url, // Keep both for compatibility
      publicId: result.public_id, // Keep both for compatibility
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
    };

    // Add video-specific properties
    if (resourceType === "video" && result.duration) {
      response.duration = result.duration;
    }

    return response;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw new Error(`Failed to upload ${resourceType}`);
  }
};

export const deleteFromCloudinary = async (
  publicId,
  resourceType = "image"
) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType === "video" ? "video" : "image",
    });
    return result;
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    throw new Error(`Failed to delete ${resourceType}`);
  }
};

export default cloudinary;
