import { useState, forwardRef, useImperativeHandle, useEffect } from "react";
import { Upload, X, Plus, Search, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";
import Image from "next/image";

export const MultiImageUpload = forwardRef(function MultiImageUpload(
  { value = [], onChange, folder = "product-inner", maxImages = 3 },
  ref
) {
  const [uploading, setUploading] = useState(false);

  // Media Library State
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [mediaLibraryImages, setMediaLibraryImages] = useState([]);
  const [mediaLibraryLoading, setMediaLibraryLoading] = useState(false);
  const [mediaSearchQuery, setMediaSearchQuery] = useState("");

  // Media Library Functions
  const fetchMediaLibraryImages = async () => {
    setMediaLibraryLoading(true);
    try {
      const response = await fetch("/api/admin/media?limit=100");
      const data = await response.json();
      if (data.success) {
        // Transform the data to match our expected format
        const transformedImages = (data.data || []).map((image) => ({
          publicId: image.public_id,
          url: image.secure_url,
          alt: image.context?.alt || image.display_name || "",
          width: image.width,
          height: image.height,
          format: image.format,
          size: image.bytes,
          createdAt: image.created_at,
          folder: image.folder,
        }));
        setMediaLibraryImages(transformedImages);
      } else {
        console.error("Failed to fetch media library:", data.error);
        setMediaLibraryImages([]);
      }
    } catch (error) {
      console.error("Error fetching media library:", error);
      setMediaLibraryImages([]);
    } finally {
      setMediaLibraryLoading(false);
    }
  };

  const openMediaLibrary = () => {
    setShowMediaLibrary(true);
    fetchMediaLibraryImages();
  };

  const selectImageFromLibrary = (libraryImage) => {
    // Check if adding this image would exceed the limit
    if (value.length >= maxImages) {
      toast.error(`Maximum ${maxImages} images allowed`);
      return;
    }

    // Check if image is already selected
    const isAlreadySelected = value.some(
      (img) => img.publicId === libraryImage.publicId
    );
    if (isAlreadySelected) {
      toast.error("This image is already selected.");
      return;
    }

    const newImage = {
      url: libraryImage.url,
      publicId: libraryImage.publicId,
      alt: libraryImage.alt || "",
    };

    onChange([...value, newImage]);
    toast.success("Image added from library");
  };

  // Filter media library images based on search query
  const filteredMediaImages = mediaLibraryImages.filter(
    (image) =>
      image.alt?.toLowerCase().includes(mediaSearchQuery.toLowerCase()) ||
      image.publicId?.toLowerCase().includes(mediaSearchQuery.toLowerCase()) ||
      image.folder?.toLowerCase().includes(mediaSearchQuery.toLowerCase())
  );

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    // Check if adding these files would exceed the limit
    if (value.length + files.length > maxImages) {
      toast.error(`Maximum ${maxImages} images allowed`);
      return;
    }

    // Validate files
    for (const file of files) {
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`File ${file.name} is too large. Maximum size is 5MB.`);
        return;
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error(`File ${file.name} is not a valid image file.`);
        return;
      }
    }

    // Create preview URLs and store file data
    const newImages = files.map((file) => ({
      file, // Store the actual file for later upload
      preview: URL.createObjectURL(file), // Create preview URL
      name: file.name,
      size: file.size,
    }));

    // Add new images to existing ones
    onChange([...value, ...newImages]);

    toast.success(`${newImages.length} image(s) selected`);
  };

  // Function to upload all images (called from parent component)
  const uploadAllImages = async () => {
    const imagesToUpload = value.filter((img) => img.file); // Only upload files that haven't been uploaded yet
    const alreadyUploaded = value.filter(
      (img) => !img.file && img.url && img.publicId
    );

    // If no images to upload, return already uploaded ones
    if (imagesToUpload.length === 0) {
      console.log(
        "No images to upload, returning already uploaded:",
        alreadyUploaded
      );
      return alreadyUploaded;
    }

    try {
      setUploading(true);
      const uploadPromises = imagesToUpload.map(async (imageData) => {
        const formData = new FormData();
        formData.append("file", imageData.file);
        formData.append("folder", folder);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();

        if (data.success) {
          return {
            url: data.data.url || data.data.secure_url,
            publicId: data.data.publicId || data.data.public_id,
          };
        } else {
          throw new Error(data.error || "Upload failed");
        }
      });

      const uploadedImages = await Promise.all(uploadPromises);

      // Combine existing uploaded images with newly uploaded ones
      const finalImages = [...alreadyUploaded, ...uploadedImages];

      // Update the component state with uploaded images
      onChange(finalImages);

      console.log("Final images from uploadAllImages:", finalImages);
      return finalImages;
    } catch (error) {
      console.error("Upload error:", error);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = async (index) => {
    const imageToRemove = value[index];

    // If it's an uploaded image (has publicId), delete from Cloudinary
    if (imageToRemove && imageToRemove.publicId) {
      try {
        await fetch("/api/upload", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ publicId: imageToRemove.publicId }),
        });
      } catch (error) {
        console.error("Error deleting image from Cloudinary:", error);
      }
    }

    // If it's a preview image, revoke the object URL
    if (imageToRemove && imageToRemove.preview) {
      URL.revokeObjectURL(imageToRemove.preview);
    }

    // Remove image from array
    const newImages = value.filter((_, i) => i !== index);
    onChange(newImages);
  };

  const canAddMore = value.length < maxImages;

  // Function to clear all preview URLs (to prevent memory leaks)
  const clearPreviews = () => {
    value.forEach((image) => {
      if (image.preview) {
        URL.revokeObjectURL(image.preview);
      }
    });
  };

  // Cleanup effect to revoke object URLs when component unmounts or value changes
  useEffect(() => {
    return () => {
      value.forEach((image) => {
        if (image.preview) {
          URL.revokeObjectURL(image.preview);
        }
      });
    };
  }, [value]);

  // Expose functions to parent component
  useImperativeHandle(ref, () => ({
    uploadAllImages,
    clearPreviews,
  }));

  return (
    <div className="space-y-4">
      {/* Upload Section */}
      {canAddMore && (
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Upload Area */}
          <div className="flex-1 border-2 border-dashed border-gray-300 hover:border-gray-400 rounded-lg p-4 sm:p-6 transition-colors">
            <div className="text-center">
              <Upload className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-gray-400" />
              <div className="mt-3 sm:mt-4">
                <label htmlFor="multi-image-upload" className="cursor-pointer">
                  <span className="mt-2 block text-base sm:text-base font-medium text-gray-900 hover:text-blue-600 transition-colors">
                    {uploading
                      ? "Uploading..."
                      : `Add Image${value.length > 0 ? "s" : ""}`}
                  </span>
                </label>
                <input
                  id="multi-image-upload"
                  type="file"
                  className="sr-only"
                  accept="image/*"
                  multiple
                  onChange={handleFileSelect}
                  disabled={uploading}
                />
              </div>
              <p className="mt-2 text-base sm:text-base text-gray-500">
                PNG, JPG, GIF up to 5MB each
              </p>
            </div>
          </div>

          {/* Choose from Library */}
          <div className="flex flex-col justify-center items-center">
            <div className="text-base text-gray-500 mb-2">OR</div>
            <Dialog open={showMediaLibrary} onOpenChange={setShowMediaLibrary}>
              <DialogTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  onClick={openMediaLibrary}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Choose from Library
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden z-[50]">
                <DialogHeader>
                  <DialogTitle>Media Library</DialogTitle>
                  <DialogDescription>
                    Select images from your uploaded media library
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search images..."
                      value={mediaSearchQuery}
                      onChange={(e) => setMediaSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {/* Media Grid */}
                  <div className="overflow-y-auto max-h-96">
                    {mediaLibraryLoading ? (
                      <div className="flex justify-center items-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
                        <span className="ml-2 text-gray-600">
                          Loading images...
                        </span>
                      </div>
                    ) : filteredMediaImages.length === 0 ? (
                      <div className="text-center py-8">
                        <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <p className="text-gray-500">
                          {mediaSearchQuery
                            ? "No images found matching your search."
                            : "No images in library yet."}
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {filteredMediaImages.map((image, index) => {
                          const isSelected = value.some(
                            (img) => img.publicId === image.publicId
                          );
                          return (
                            <div
                              key={`${image.publicId}-${index}`}
                              className={`relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                                isSelected
                                  ? "border-green-500 bg-green-50"
                                  : "border-gray-200 hover:border-blue-400"
                              }`}
                              onClick={() => selectImageFromLibrary(image)}
                            >
                              <img
                                src={image.url}
                                alt={image.alt || "Media library image"}
                                className="w-full h-24 object-cover"
                              />
                              {isSelected && (
                                <div className="absolute inset-0 bg-green-500 bg-opacity-20 flex items-center justify-center">
                                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                    <svg
                                      className="w-4 h-4 text-white"
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      )}

      {/* Status indicator */}
      {canAddMore && (
        <div className="text-center">
          <p className="text-base text-gray-400">
            {value.length}/{maxImages} images added
          </p>
        </div>
      )}

      {/* Image Grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {value
            .filter((image) => image && (image.url || image.preview))
            .map((image, index) => {
              const imageSrc = image.url || image.preview;
              if (!imageSrc) return null;

              return (
                <div
                  key={`${image.publicId || image.name || index}-${index}`}
                  className="relative group aspect-square"
                >
                  <Image
                    src={imageSrc}
                    alt={`Product inner ${index + 1}`}
                    width={200}
                    height={200}
                    className="w-full h-full object-cover rounded-lg border-2 border-gray-200 hover:border-blue-300 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(value.indexOf(image))}
                    className="absolute top-1 right-1 sm:top-2 sm:right-2 p-1 bg-red-500 text-white rounded-full opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 z-10"
                  >
                    <X className="h-3 w-3 sm:h-4 sm:w-4" />
                  </button>
                  <div className="absolute bottom-1 left-1 sm:bottom-2 sm:left-2 bg-black bg-opacity-70 text-white px-1.5 py-0.5 sm:px-2 sm:py-1 rounded text-base font-medium">
                    {value.indexOf(image) + 1}
                  </div>
                  {image.file && (
                    <div className="absolute top-1 left-1 sm:top-2 sm:left-2 bg-blue-500 text-white px-1.5 py-0.5 sm:px-2 sm:py-1 rounded text-base font-medium">
                      Preview
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      )}

      {/* Add More Button (when images exist but can add more) */}
      {value.length > 0 && canAddMore && (
        <Button
          type="button"
          variant="outline"
          className="w-full sm:w-auto mx-auto flex items-center justify-center"
          asChild
        >
          <label
            htmlFor="multi-image-upload-more"
            className="cursor-pointer flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            <span className="text-base sm:text-base">
              Add More Images ({value.length}/{maxImages})
            </span>
            <input
              id="multi-image-upload-more"
              type="file"
              className="sr-only"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              disabled={uploading}
            />
          </label>
        </Button>
      )}

      {uploading && (
        <div className="text-center py-3 sm:py-4">
          <div className="inline-flex items-center px-3 py-2 sm:px-4 sm:py-2 bg-blue-50 rounded-lg border border-blue-200">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-200 border-t-blue-600 mr-2"></div>
            <span className="text-blue-700 text-base sm:text-base font-medium">
              Uploading images...
            </span>
          </div>
        </div>
      )}
    </div>
  );
});
