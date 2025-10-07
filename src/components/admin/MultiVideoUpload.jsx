import { useState, forwardRef, useImperativeHandle, useEffect } from "react";
import {
  Upload,
  X,
  Plus,
  Search,
  Video as VideoIcon,
  Play,
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
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";

export const MultiVideoUpload = forwardRef(function MultiVideoUpload(
  { value = [], onChange, folder = "product-inner", maxVideos = 2 },
  ref
) {
  const [uploading, setUploading] = useState(false);

  // Media Library State
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [mediaLibraryVideos, setMediaLibraryVideos] = useState([]);
  const [mediaLibraryLoading, setMediaLibraryLoading] = useState(false);
  const [mediaSearchQuery, setMediaSearchQuery] = useState("");

  // Media Library Functions
  const fetchMediaLibraryVideos = async () => {
    setMediaLibraryLoading(true);
    try {
      const response = await fetch(
        "/api/admin/media?limit=100&resource_type=video"
      );
      const data = await response.json();
      if (data.success) {
        // Filter only video files and transform the data
        const transformedVideos = (data.data || [])
          .filter((media) => media.resource_type === "video")
          .map((video) => ({
            publicId: video.public_id,
            url: video.secure_url,
            alt: video.context?.alt || video.display_name || "",
            width: video.width,
            height: video.height,
            format: video.format,
            size: video.bytes,
            duration: video.duration,
            createdAt: video.created_at,
            folder: video.folder,
          }));
        setMediaLibraryVideos(transformedVideos);
        console.log("Fetched videos from library:", transformedVideos.length);
      } else {
        console.error("Failed to fetch media library:", data.error);
        setMediaLibraryVideos([]);
      }
    } catch (error) {
      console.error("Error fetching media library:", error);
      setMediaLibraryVideos([]);
    } finally {
      setMediaLibraryLoading(false);
    }
  };

  const selectFromLibrary = (video) => {
    // Check if we're at max capacity
    if (value.length >= maxVideos) {
      toast.error(`You can only select up to ${maxVideos} videos`);
      return;
    }

    const newVideo = {
      url: video.url,
      publicId: video.publicId || "",
      alt: video.alt || "",
      width: video.width,
      height: video.height,
      format: video.format,
      size: video.size,
      duration: video.duration,
    };

    const updatedVideos = [...value, newVideo];
    onChange(updatedVideos);
    setShowMediaLibrary(false);
    toast.success("Video selected from library");
  };

  const filteredLibraryVideos = mediaLibraryVideos.filter(
    (video) =>
      video.alt?.toLowerCase().includes(mediaSearchQuery.toLowerCase()) ||
      video.publicId?.toLowerCase().includes(mediaSearchQuery.toLowerCase())
  );

  // File Upload Functions
  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    // Check if adding these files would exceed max limit
    if (value.length + files.length > maxVideos) {
      toast.error(`You can only upload up to ${maxVideos} videos`);
      return;
    }

    // Validate file types
    const validTypes = ["video/mp4", "video/mov", "video/avi", "video/webm"];
    const invalidFiles = files.filter(
      (file) => !validTypes.includes(file.type)
    );

    if (invalidFiles.length > 0) {
      toast.error("Please select only video files (MP4, MOV, AVI, WebM)");
      return;
    }

    // Check file sizes (max 50MB per video)
    const maxSize = 50 * 1024 * 1024; // 50MB
    const oversizedFiles = files.filter((file) => file.size > maxSize);

    if (oversizedFiles.length > 0) {
      toast.error("Video files must be smaller than 50MB each");
      return;
    }

    // Create preview videos with File objects
    const newVideos = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      alt: file.name.split(".")[0],
      size: file.size,
    }));

    const updatedVideos = [...value, ...newVideos];
    onChange(updatedVideos);

    // Clear the input
    e.target.value = "";
  };

  const removeVideo = (index) => {
    const videoToRemove = value[index];

    // Revoke object URL if it's a preview
    if (videoToRemove.preview) {
      URL.revokeObjectURL(videoToRemove.preview);
    }

    const updatedVideos = value.filter((_, i) => i !== index);
    onChange(updatedVideos);
  };

  const uploadAllVideos = async () => {
    const videosToUpload = value.filter((video) => video.file);

    if (videosToUpload.length === 0) {
      // Return existing videos that are already uploaded
      return value.filter((video) => !video.file);
    }

    setUploading(true);
    const uploadedVideos = [];

    try {
      for (const video of videosToUpload) {
        const formData = new FormData();
        formData.append("file", video.file);
        formData.append("folder", folder);
        formData.append("resource_type", "video");

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();

        if (data.success) {
          uploadedVideos.push({
            url: data.secure_url,
            publicId: data.public_id,
            alt: video.alt || "",
            width: data.width,
            height: data.height,
            format: data.format,
            size: data.bytes,
            duration: data.duration,
          });

          // Clean up preview URL
          if (video.preview) {
            URL.revokeObjectURL(video.preview);
          }
        } else {
          console.error("Upload failed:", data);
          throw new Error(data.error || "Upload failed");
        }
      }

      // Combine uploaded videos with existing ones
      const existingUploadedVideos = value.filter((video) => !video.file);
      const allVideos = [...existingUploadedVideos, ...uploadedVideos];

      // Update the form with uploaded videos
      onChange(allVideos);

      return allVideos;
    } catch (error) {
      console.error("Error uploading videos:", error);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const clearPreviews = () => {
    // Clean up preview URLs
    value.forEach((video) => {
      if (video.preview) {
        URL.revokeObjectURL(video.preview);
      }
    });

    onChange([]);
  };

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    uploadAllVideos,
    clearPreviews,
  }));

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      value.forEach((video) => {
        if (video.preview) {
          URL.revokeObjectURL(video.preview);
        }
      });
    };
  }, []);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDuration = (seconds) => {
    if (!seconds) return "Unknown";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-4">
      {/* Upload Controls */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1">
          <input
            type="file"
            accept="video/mp4,video/mov,video/avi,video/webm"
            onChange={handleFileChange}
            multiple
            className="hidden"
            id="video-upload"
            disabled={value.length >= maxVideos}
          />
          <label htmlFor="video-upload">
            <Button
              type="button"
              variant="outline"
              className="w-full cursor-pointer"
              disabled={value.length >= maxVideos || uploading}
              asChild
            >
              <span>
                <Upload className="h-4 w-4 mr-2" />
                Upload New Video
                {value.length >= maxVideos ? "s (Max reached)" : "s"}
              </span>
            </Button>
          </label>
        </div>

        <Dialog open={showMediaLibrary} onOpenChange={setShowMediaLibrary}>
          <DialogTrigger asChild>
            <Button
              type="button"
              variant="outline"
              disabled={value.length >= maxVideos}
              onClick={() => {
                setShowMediaLibrary(true);
                fetchMediaLibraryVideos();
              }}
            >
              <Search className="h-4 w-4 mr-2" />
              Choose from Library
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden z-[50]">
            <DialogHeader>
              <DialogTitle>Select Video from Library</DialogTitle>
              <DialogDescription>
                Choose from previously uploaded videos
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search videos..."
                  value={mediaSearchQuery}
                  onChange={(e) => setMediaSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="max-h-96 overflow-y-auto">
                {mediaLibraryLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="text-sm text-muted-foreground">
                      Loading videos...
                    </div>
                  </div>
                ) : filteredLibraryVideos.length === 0 ? (
                  <div className="text-center py-8">
                    <VideoIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-2 text-sm font-semibold text-gray-900">
                      No videos found
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {mediaSearchQuery
                        ? "Try a different search term"
                        : "Upload some videos to get started"}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {filteredLibraryVideos.map((video, index) => (
                      <div
                        key={video.publicId || index}
                        className="relative group cursor-pointer border border-gray-200 rounded-lg overflow-hidden hover:border-primary transition-colors"
                        onClick={() => selectFromLibrary(video)}
                      >
                        <div className="aspect-video bg-gray-100 flex items-center justify-center relative">
                          <video
                            src={video.url}
                            className="w-full h-full object-cover"
                            muted
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                            <Play className="h-8 w-8 text-white" />
                          </div>
                        </div>
                        <div className="p-2">
                          <p
                            className="text-xs font-medium truncate"
                            title={video.alt}
                          >
                            {video.alt || "Untitled"}
                          </p>
                          <div className="text-xs text-muted-foreground space-y-1">
                            <p>{formatFileSize(video.size)}</p>
                            <p>{formatDuration(video.duration)}</p>
                            <p>{video.format?.toUpperCase()}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Video Previews */}
      {value.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {value.map((video, index) => (
            <div
              key={index}
              className="relative border border-gray-200 rounded-lg overflow-hidden"
            >
              <div className="aspect-video bg-gray-100">
                <video
                  src={video.preview || video.url}
                  controls
                  className="w-full h-full object-cover"
                  preload="metadata"
                />
              </div>

              <div className="p-3 space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {video.alt || "Video"}
                    </p>
                    <div className="text-xs text-muted-foreground space-y-1">
                      {video.size && <p>{formatFileSize(video.size)}</p>}
                      {video.duration && (
                        <p>{formatDuration(video.duration)}</p>
                      )}
                      {video.format && <p>{video.format.toUpperCase()}</p>}
                      {video.file && (
                        <p className="text-blue-600">New upload</p>
                      )}
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeVideo(index)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Status */}
      {uploading && (
        <div className="flex items-center justify-center py-4">
          <div className="text-sm text-muted-foreground">
            Uploading videos to Cloudinary...
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="text-xs text-muted-foreground">
        <p>• Maximum {maxVideos} videos allowed</p>
        <p>• Supported formats: MP4, MOV, AVI, WebM</p>
        <p>• Maximum file size: 50MB per video</p>
      </div>
    </div>
  );
});

export default MultiVideoUpload;
