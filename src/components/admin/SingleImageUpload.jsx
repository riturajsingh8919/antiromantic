import { useState, forwardRef, useImperativeHandle, useEffect } from "react";
import {
  Upload,
  X,
  Search,
  Image as ImageIcon,
  Trash2,
  Edit,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";
import Image from "next/image";

export const SingleImageUpload = forwardRef(function SingleImageUpload(
  {
    value = null,
    onChange,
    label = "Image",
    folder = "image-manager",
    onDelete,
    className = "",
  },
  ref
) {
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Media Library State
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [mediaLibraryImages, setMediaLibraryImages] = useState([]);
  const [mediaLibraryLoading, setMediaLibraryLoading] = useState(false);
  const [mediaSearchQuery, setMediaSearchQuery] = useState("");

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    clearImage: () => {
      onChange(null);
    },
  }));

  // Media Library Functions
  const fetchMediaLibraryImages = async () => {
    setMediaLibraryLoading(true);
    try {
      const response = await fetch(
        "/api/admin/media?limit=100&resource_type=image"
      );
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
    const newImage = {
      url: libraryImage.url,
      publicId: libraryImage.publicId,
      alt: libraryImage.alt || label,
      width: libraryImage.width,
      height: libraryImage.height,
      format: libraryImage.format,
      size: libraryImage.size,
      createdAt: libraryImage.createdAt,
    };

    onChange(newImage);
    setShowMediaLibrary(false);
    toast.success("Image selected from library");
  };

  // Filter media library images based on search query
  const filteredMediaImages = mediaLibraryImages.filter(
    (image) =>
      image.alt?.toLowerCase().includes(mediaSearchQuery.toLowerCase()) ||
      image.publicId?.toLowerCase().includes(mediaSearchQuery.toLowerCase()) ||
      image.folder?.toLowerCase().includes(mediaSearchQuery.toLowerCase())
  );

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error("Image size must be less than 10MB");
      return;
    }

    await uploadImage(file);

    // Clear the input
    e.target.value = "";
  };

  const uploadImage = async (file) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      const response = await fetch("/api/admin/media/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        const newImage = {
          url: data.data.secure_url,
          publicId: data.data.public_id,
          alt: label,
          width: data.data.width,
          height: data.data.height,
          format: data.data.format,
          size: data.data.bytes,
          createdAt: data.data.created_at,
        };

        onChange(newImage);
        toast.success("Image uploaded successfully!");
      } else {
        toast.error(data.error || "Failed to upload image");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!value || !onDelete) return;

    setDeleting(true);
    try {
      await onDelete();
      onChange(null);
      toast.success("Image deleted successfully");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete image");
    } finally {
      setDeleting(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className={`space-y-3 w-full max-w-full overflow-hidden ${className}`}>
      {/* Image Display */}
      {value ? (
        <div className="relative group w-full">
          <div className="relative w-full border-2 border-dashed border-gray-300 rounded-lg overflow-hidden bg-white">
            <Image
              src={value.url}
              alt={value.alt || label}
              width={400}
              height={300}
              className="w-full h-32 sm:h-40 object-cover"
            />

            {/* Image Info Overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
              <div className="text-white text-center p-2">
                <p className="text-xs font-medium">
                  {value.format?.toUpperCase()}
                </p>
                <p className="text-xs">
                  {value.width} x {value.height}
                </p>
                <p className="text-xs">{formatFileSize(value.size)}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="absolute top-2 right-2 flex gap-1">
              <Button
                size="sm"
                variant="secondary"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  document
                    .getElementById(
                      `file-input-${label.replace(/\s+/g, "-").toLowerCase()}`
                    )
                    .click();
                }}
                disabled={uploading}
                className="h-7 w-7 p-0 bg-white/90 hover:bg-white"
                type="button"
              >
                <Edit className="h-3 w-3" />
              </Button>

              {onDelete && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={deleting}
                      className="h-7 w-7 p-0 bg-red-500/90 hover:bg-red-600"
                      type="button"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete {label}?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently
                        delete the {label.toLowerCase()}
                        from both the database and Cloudinary.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        disabled={deleting}
                      >
                        {deleting ? "Deleting..." : "Delete"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Upload Area */
        <div className="w-full">
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-6 text-center hover:border-gray-400 transition-colors cursor-pointer bg-gray-50/50"
            onClick={() => {
              document
                .getElementById(
                  `file-input-${label.replace(/\s+/g, "-").toLowerCase()}`
                )
                .click();
            }}
          >
            <ImageIcon className="mx-auto h-8 w-8 sm:h-10 sm:w-10 text-gray-400 mb-2" />
            <p className="text-xs sm:text-sm text-gray-600 mb-1">
              Click to upload {label.toLowerCase()}
            </p>
            <p className="text-xs text-gray-500">PNG, JPG, JPEG up to 10MB</p>
          </div>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        id={`file-input-${label.replace(/\s+/g, "-").toLowerCase()}`}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading}
      />

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-2 w-full max-w-full">
        <Button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            document
              .getElementById(
                `file-input-${label.replace(/\s+/g, "-").toLowerCase()}`
              )
              .click();
          }}
          disabled={uploading}
          variant="outline"
          size="sm"
          className="flex-1 min-w-0 max-w-full"
          type="button"
        >
          <Upload className="w-4 h-4 mr-1 flex-shrink-0" />
          <span className="truncate">
            {uploading ? "Uploading..." : value ? "Replace" : "Upload"}
          </span>
        </Button>

        <Button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            openMediaLibrary();
          }}
          variant="outline"
          size="sm"
          className="flex-1 min-w-0 max-w-full"
          type="button"
        >
          <Search className="w-4 h-4 mr-1 flex-shrink-0" />
          <span className="truncate">Browse</span>
        </Button>
      </div>

      {/* Media Library Dialog */}
      <Dialog open={showMediaLibrary} onOpenChange={setShowMediaLibrary}>
        <DialogContent className="max-w-4xl w-[95vw] max-h-[85vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Select from Media Library</DialogTitle>
            <DialogDescription>
              Choose an image from your existing media library
            </DialogDescription>
          </DialogHeader>

          {/* Search */}
          <div className="flex items-center space-x-2 mb-4">
            <Search className="w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search images..."
              value={mediaSearchQuery}
              onChange={(e) => setMediaSearchQuery(e.target.value)}
              className="flex-1"
            />
          </div>

          {/* Images Grid */}
          <div className="flex-1 overflow-y-auto">
            {mediaLibraryLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
                  <p className="text-sm text-gray-600">Loading images...</p>
                </div>
              </div>
            ) : filteredMediaImages.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredMediaImages.map((image) => (
                  <div
                    key={image.publicId}
                    className="relative group cursor-pointer border-2 border-transparent hover:border-blue-500 rounded-lg overflow-hidden transition-all duration-200"
                    onClick={() => selectImageFromLibrary(image)}
                  >
                    <Image
                      src={image.url}
                      alt={image.alt || "Media Library Image"}
                      width={200}
                      height={150}
                      className="w-full h-32 object-cover"
                    />
                    {/* <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center"> */}
                    <Button
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    >
                      Select
                    </Button>
                    {/* </div> */}
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white p-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <p className="truncate">{image.alt || "Untitled"}</p>
                      <p>
                        {image.width} x {image.height}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-sm text-gray-600">
                    {mediaSearchQuery
                      ? "No images found matching your search"
                      : "No images in library"}
                  </p>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
});
