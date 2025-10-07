"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Image as ImageIcon,
  Video as VideoIcon,
  Upload,
  Search,
  MoreVertical,
  Copy,
  Trash2,
  Download,
  Eye,
  RefreshCw,
  Grid3X3,
  List,
  Play,
} from "lucide-react";
import Image from "next/image";

export default function MediaPage() {
  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [videoLoading, setVideoLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [videoUploading, setVideoUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [videoSearchTerm, setVideoSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid"); // grid or list
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [imageToDelete, setImageToDelete] = useState(null);
  const [videoToDelete, setVideoToDelete] = useState(null);

  useEffect(() => {
    fetchImages();
    fetchVideos();
  }, []);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/media?resource_type=image");
      const data = await response.json();
      if (data.success) {
        setImages(data.data);
      }
    } catch (error) {
      console.error("Error fetching images:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVideos = async () => {
    try {
      setVideoLoading(true);
      const response = await fetch("/api/admin/media?resource_type=video");
      const data = await response.json();
      if (data.success) {
        setVideos(data.data);
      }
    } catch (error) {
      console.error("Error fetching videos:", error);
    } finally {
      setVideoLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setUploading(true);
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("resource_type", "image");

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Upload failed");
        }
      }

      // Refresh the images list
      await fetchImages();
    } catch (error) {
      console.error("Error uploading images:", error);
      alert("Error uploading images. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleVideoUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    // Validate file types
    const validTypes = ["video/mp4", "video/mov", "video/avi", "video/webm"];
    const invalidFiles = files.filter(
      (file) => !validTypes.includes(file.type)
    );

    if (invalidFiles.length > 0) {
      alert("Please select only video files (MP4, MOV, AVI, WebM)");
      return;
    }

    // Check file sizes (max 50MB per video)
    const maxSize = 50 * 1024 * 1024; // 50MB
    const oversizedFiles = files.filter((file) => file.size > maxSize);

    if (oversizedFiles.length > 0) {
      alert("Video files must be smaller than 50MB each");
      return;
    }

    setVideoUploading(true);
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("resource_type", "video");

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Upload failed");
        }
      }

      // Refresh the videos list
      await fetchVideos();
      alert("Videos uploaded successfully!");
    } catch (error) {
      console.error("Error uploading videos:", error);
      alert("Error uploading videos. Please try again.");
    } finally {
      setVideoUploading(false);
    }
  };

  const handleDeleteImage = async (imageId) => {
    try {
      // URL encode the public_id to handle special characters and slashes
      const encodedId = encodeURIComponent(imageId);
      const response = await fetch(`/api/admin/media/${encodedId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok && data.success) {
        await fetchImages();
        setDeleteDialogOpen(false);
        setImageToDelete(null);
        alert("Image deleted successfully!");
      } else {
        throw new Error(data.error || "Delete failed");
      }
    } catch (error) {
      console.error("Error deleting image:", error);
      alert(`Error deleting image: ${error.message}`);
    }
  };

  const handleDeleteVideo = async (videoId) => {
    try {
      // URL encode the public_id to handle special characters and slashes
      const encodedId = encodeURIComponent(videoId);
      const response = await fetch(`/api/admin/media/${encodedId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok && data.success) {
        await fetchVideos();
        setDeleteDialogOpen(false);
        setVideoToDelete(null);
        alert("Video deleted successfully!");
      } else {
        throw new Error(data.error || "Delete failed");
      }
    } catch (error) {
      console.error("Error deleting video:", error);
      alert(`Error deleting video: ${error.message}`);
    }
  };

  const copyToClipboard = (url) => {
    navigator.clipboard.writeText(url);
    // You could add a toast notification here
    alert("Image URL copied to clipboard!");
  };

  const downloadImage = (url, filename) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredImages = images.filter((image) => {
    const matchesSearch =
      image.public_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (image.context?.alt || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  const filteredVideos = videos.filter((video) => {
    const matchesSearch =
      video.public_id.toLowerCase().includes(videoSearchTerm.toLowerCase()) ||
      (video.context?.alt || "")
        .toLowerCase()
        .includes(videoSearchTerm.toLowerCase());

    return matchesSearch;
  });

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDuration = (seconds) => {
    if (!seconds) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Media Library</h1>
          <p className="text-muted-foreground">
            Upload and manage your store images
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => {
              fetchImages();
              fetchVideos();
            }}
            disabled={loading || videoLoading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${
                loading || videoLoading ? "animate-spin" : ""
              }`}
            />
            Refresh
          </Button>
          <Button asChild>
            <label htmlFor="upload-images" className="cursor-pointer">
              <Upload className="h-4 w-4 mr-2" />
              {uploading ? "Uploading..." : "Upload Images"}
              <input
                id="upload-images"
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>
          </Button>
          <Button asChild variant="outline">
            <label htmlFor="upload-videos" className="cursor-pointer">
              <VideoIcon className="h-4 w-4 mr-2" />
              {videoUploading ? "Uploading..." : "Upload Videos"}
              <input
                id="upload-videos"
                type="file"
                multiple
                accept="video/mp4,video/mov,video/avi,video/webm"
                onChange={handleVideoUpload}
                className="hidden"
                disabled={videoUploading}
              />
            </label>
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search images..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-1 border rounded-md p-1">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Images Display */}
      <Card>
        <CardHeader>
          <CardTitle>
            Images ({filteredImages.length})
            {searchTerm && (
              <span className="text-base font-normal text-muted-foreground ml-2">
                - Showing results for &quot;{searchTerm}&quot;
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="aspect-square bg-muted rounded-lg animate-pulse"
                />
              ))}
            </div>
          ) : filteredImages.length === 0 ? (
            <div className="text-center py-12">
              <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {searchTerm ? "No images found" : "No images uploaded yet"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm
                  ? "Try adjusting your search terms or filters"
                  : "Upload your first image to get started"}
              </p>
              {!searchTerm && (
                <Button asChild>
                  <label
                    htmlFor="upload-images-empty"
                    className="cursor-pointer"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Images
                    <input
                      id="upload-images-empty"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>
                </Button>
              )}
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {filteredImages.map((image) => (
                <div
                  key={image.public_id}
                  className="group relative aspect-square bg-muted rounded-lg overflow-hidden border hover:shadow-md transition-shadow"
                >
                  <Image
                    src={image.secure_url}
                    alt={image.context?.alt || image.public_id}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 16vw"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setSelectedImage(image)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="secondary">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem
                            onClick={() => copyToClipboard(image.secure_url)}
                          >
                            <Copy className="h-4 w-4 mr-2" />
                            Copy URL
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              downloadImage(image.secure_url, image.public_id)
                            }
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setImageToDelete(image);
                              setDeleteDialogOpen(true);
                            }}
                            className="text-gray-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                    <p className="text-white text-base truncate">
                      {image.public_id.split("/").pop()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredImages.map((image) => (
                <div
                  key={image.public_id}
                  className="flex items-center gap-4 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="relative w-16 h-16 bg-muted rounded overflow-hidden flex-shrink-0">
                    <Image
                      src={image.secure_url}
                      alt={image.context?.alt || image.public_id}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {image.public_id.split("/").pop()}
                    </p>
                    <div className="flex items-center gap-4 text-base text-muted-foreground">
                      <span>
                        {image.width} × {image.height}
                      </span>
                      <span>{formatFileSize(image.bytes)}</span>
                      <span>{formatDate(image.created_at)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {image.format.toUpperCase()}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="ghost">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem
                          onClick={() => setSelectedImage(image)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => copyToClipboard(image.secure_url)}
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copy URL
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            downloadImage(image.secure_url, image.public_id)
                          }
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setImageToDelete(image);
                            setDeleteDialogOpen(true);
                          }}
                          className="text-gray-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Videos Display */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle>
              Videos ({filteredVideos.length})
              {videoSearchTerm && (
                <span className="text-base font-normal text-muted-foreground ml-2">
                  - Showing results for &quot;{videoSearchTerm}&quot;
                </span>
              )}
            </CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search videos..."
                value={videoSearchTerm}
                onChange={(e) => setVideoSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {videoLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="aspect-video bg-muted rounded-lg animate-pulse"
                />
              ))}
            </div>
          ) : filteredVideos.length === 0 ? (
            <div className="text-center py-12">
              <VideoIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {videoSearchTerm ? "No videos found" : "No videos uploaded yet"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {videoSearchTerm
                  ? "Try adjusting your search terms"
                  : "Upload your first video to get started"}
              </p>
              {!videoSearchTerm && (
                <Button asChild variant="outline">
                  <label
                    htmlFor="upload-videos-empty"
                    className="cursor-pointer"
                  >
                    <VideoIcon className="h-4 w-4 mr-2" />
                    Upload Videos
                    <input
                      id="upload-videos-empty"
                      type="file"
                      multiple
                      accept="video/mp4,video/mov,video/avi,video/webm"
                      onChange={handleVideoUpload}
                      className="hidden"
                      disabled={videoUploading}
                    />
                  </label>
                </Button>
              )}
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {filteredVideos.map((video) => (
                <div
                  key={video.public_id}
                  className="group relative aspect-video bg-muted rounded-lg overflow-hidden border hover:shadow-md transition-shadow"
                >
                  <video
                    src={video.secure_url}
                    className="w-full h-full object-cover"
                    preload="metadata"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <Play className="h-8 w-8 text-white" />
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                    {formatDuration(video.duration)}
                  </div>
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setSelectedVideo(video)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="secondary">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem
                            onClick={() => copyToClipboard(video.secure_url)}
                          >
                            <Copy className="h-4 w-4 mr-2" />
                            Copy URL
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              downloadImage(
                                video.secure_url,
                                video.public_id.split("/").pop()
                              )
                            }
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setVideoToDelete(video);
                              setDeleteDialogOpen(true);
                            }}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredVideos.map((video) => (
                <div
                  key={video.public_id}
                  className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50"
                >
                  <div className="relative w-24 h-16 bg-muted rounded overflow-hidden flex-shrink-0">
                    <video
                      src={video.secure_url}
                      className="w-full h-full object-cover"
                      preload="metadata"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <Play className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">
                      {video.public_id.split("/").pop()}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {formatFileSize(video.bytes)} •{" "}
                      {formatDuration(video.duration)} •{" "}
                      {formatDate(video.created_at)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedVideo(video)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="outline">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem
                          onClick={() => copyToClipboard(video.secure_url)}
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copy URL
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            downloadImage(
                              video.secure_url,
                              video.public_id.split("/").pop()
                            )
                          }
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setVideoToDelete(video);
                            setDeleteDialogOpen(true);
                          }}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Image Preview Dialog */}
      {selectedImage && (
        <Dialog
          open={!!selectedImage}
          onOpenChange={() => setSelectedImage(null)}
        >
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>
                {selectedImage.public_id.split("/").pop()}
              </DialogTitle>
              <DialogDescription>Image details and metadata</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 text-base mb-4">
              <div>
                <strong>Dimensions:</strong> {selectedImage.width} ×{" "}
                {selectedImage.height}
              </div>
              <div>
                <strong>Format:</strong> {selectedImage.format.toUpperCase()}
              </div>
              <div>
                <strong>Size:</strong> {formatFileSize(selectedImage.bytes)}
              </div>
              <div>
                <strong>Created:</strong> {formatDate(selectedImage.created_at)}
              </div>
            </div>
            <div className="relative aspect-video max-h-96 bg-muted rounded overflow-hidden">
              <Image
                src={selectedImage.secure_url}
                alt={selectedImage.context?.alt || selectedImage.public_id}
                fill
                className="object-cover"
                sizes="(max-width: 896px) 100vw, 896px"
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => copyToClipboard(selectedImage.secure_url)}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy URL
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  downloadImage(
                    selectedImage.secure_url,
                    selectedImage.public_id
                  )
                }
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Video Preview Dialog */}
      {selectedVideo && (
        <Dialog
          open={!!selectedVideo}
          onOpenChange={() => setSelectedVideo(null)}
        >
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>
                {selectedVideo.public_id.split("/").pop()}
              </DialogTitle>
              <DialogDescription>Video details and preview</DialogDescription>
            </DialogHeader>
            <div className="space-y-2 text-sm">
              <div>
                <strong>Format:</strong> {selectedVideo.format?.toUpperCase()}
              </div>
              <div>
                <strong>Duration:</strong>{" "}
                {formatDuration(selectedVideo.duration)}
              </div>
              <div>
                <strong>Dimensions:</strong> {selectedVideo.width} x{" "}
                {selectedVideo.height}
              </div>
              <div>
                <strong>Size:</strong> {formatFileSize(selectedVideo.bytes)}
              </div>
              <div>
                <strong>Created:</strong> {formatDate(selectedVideo.created_at)}
              </div>
            </div>
            <div className="relative aspect-video max-h-96 bg-muted rounded overflow-hidden">
              <video
                src={selectedVideo.secure_url}
                controls
                className="w-full h-full object-cover"
                preload="metadata"
              >
                Your browser does not support the video tag.
              </video>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => copyToClipboard(selectedVideo.secure_url)}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy URL
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  downloadImage(
                    selectedVideo.secure_url,
                    selectedVideo.public_id
                  )
                }
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Delete {imageToDelete ? "Image" : "Video"}
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this{" "}
              {imageToDelete ? "image" : "video"}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {imageToDelete && (
            <div className="flex items-center gap-3 p-3 border rounded">
              <div className="relative w-12 h-12 bg-muted rounded overflow-hidden">
                <Image
                  src={imageToDelete.secure_url}
                  alt={imageToDelete.public_id}
                  fill
                  className="object-cover"
                  sizes="48px"
                />
              </div>
              <span className="font-medium">
                {imageToDelete.public_id.split("/").pop()}
              </span>
            </div>
          )}
          {videoToDelete && (
            <div className="flex items-center gap-3 p-3 border rounded">
              <div className="relative w-12 h-8 bg-muted rounded overflow-hidden">
                <video
                  src={videoToDelete.secure_url}
                  className="w-full h-full object-cover"
                  preload="metadata"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <Play className="h-3 w-3 text-white" />
                </div>
              </div>
              <span className="font-medium">
                {videoToDelete.public_id.split("/").pop()}
              </span>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setImageToDelete(null);
                setVideoToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (imageToDelete) {
                  handleDeleteImage(imageToDelete.public_id);
                } else if (videoToDelete) {
                  handleDeleteVideo(videoToDelete.public_id);
                }
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
