"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  Image as ImageIcon,
  Video as VideoIcon,
  Type,
  GripVertical,
  Package,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import toast from "react-hot-toast";
import { MultiImageUpload } from "@/components/admin/MultiImageUpload";
import { MultiVideoUpload } from "@/components/admin/MultiVideoUpload";

export default function ProductInnerPage() {
  const [productInners, setProductInners] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const multiImageUploadRef = useRef(null);
  const multiVideoUploadRef = useRef(null);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    type: "image",
    images: [],
    videos: [],
    description: "",
    buttonText: "",
    link: "",
    isActive: true,
    order: 0,
    productId: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState("");

  // Effect to handle dialog close cleanup
  useEffect(() => {
    if (!dialogOpen) {
      // Reset form when dialog closes
      setTimeout(() => {
        setEditingItem(null);
        setFormData({
          type: "image",
          images: [],
          videos: [],
          description: "",
          buttonText: "",
          link: "",
          isActive: true,
          order: 0,
          productId: "",
        });
        // Ensure body pointer-events are reset
        document.body.style.pointerEvents = "";
      }, 100);
    }
  }, [dialogOpen]);

  // Custom onOpenChange handler to ensure proper cleanup
  const handleDialogOpenChange = (open) => {
    setDialogOpen(open);
    if (!open) {
      // Immediately reset body styles when dialog closes
      setTimeout(() => {
        document.body.style.pointerEvents = "";
        document.body.style.overflow = "";
      }, 50);
    }
  };

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(10); // Show 20 items per page

  const fetchProductInners = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
      });

      if (selectedProduct) {
        params.append("productId", selectedProduct);
      }

      const url = `/api/admin/product-inner?${params.toString()}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        console.log("Fetched product inner items:", data.data);
        setProductInners(data.data);

        // Update pagination info
        if (data.pagination) {
          setTotalPages(data.pagination.totalPages);
          setTotalItems(data.pagination.total);
        }
      } else {
        console.error("Fetch error response:", data);
        toast.error("Failed to fetch product inner items");
      }
    } catch (error) {
      console.error("Error fetching product inner items:", error);
      toast.error("Failed to fetch product inner items");
    } finally {
      setLoading(false);
    }
  }, [selectedProduct, currentPage, itemsPerPage]);

  const fetchProducts = useCallback(async () => {
    try {
      setProductsLoading(true);
      const response = await fetch("/api/admin/products?limit=100");
      const data = await response.json();

      if (data.success) {
        setProducts(data.data);
      } else {
        toast.error("Failed to fetch products");
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to fetch products");
    } finally {
      setProductsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    fetchProductInners();
  }, [fetchProductInners]);

  // Reset pagination when selected product changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedProduct]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.productId) {
      toast.error("Please select a product");
      return;
    }

    if (
      formData.type === "image" &&
      (!formData.images || formData.images.length === 0)
    ) {
      toast.error("Please select at least one image");
      return;
    }

    if (
      formData.type === "video" &&
      (!formData.videos || formData.videos.length === 0)
    ) {
      toast.error("Please select at least one video");
      return;
    }

    console.log("Form validation passed. Form data:", formData);

    if (formData.type === "text" && !formData.description.trim()) {
      toast.error("Please enter a description");
      return;
    }

    // Validate duplicate types per product (only one image and one text type allowed per product)
    const existingItemsForProduct = productInners.filter((item) => {
      // Handle both populated (object) and non-populated (string) productId
      const itemProductId =
        typeof item.productId === "object"
          ? item.productId._id
          : item.productId;
      return itemProductId === formData.productId;
    });

    // If editing, exclude the current item from validation
    const otherItemsForProduct = editingItem
      ? existingItemsForProduct.filter((item) => item._id !== editingItem._id)
      : existingItemsForProduct;

    const existingImageItems = otherItemsForProduct.filter(
      (item) => item.type === "image"
    );
    const existingVideoItems = otherItemsForProduct.filter(
      (item) => item.type === "video"
    );
    const existingTextItems = otherItemsForProduct.filter(
      (item) => item.type === "text"
    );

    console.log("Validation Debug:", {
      selectedProductId: formData.productId,
      existingItemsForProduct: existingItemsForProduct.length,
      otherItemsForProduct: otherItemsForProduct.length,
      existingImageItems: existingImageItems.length,
      existingVideoItems: existingVideoItems.length,
      existingTextItems: existingTextItems.length,
      formType: formData.type,
      isEditing: !!editingItem,
    });

    if (formData.type === "image" && existingImageItems.length > 0) {
      toast.error(
        "This product already has an image type item. Only one image type is allowed per product."
      );
      return;
    }

    if (formData.type === "video" && existingVideoItems.length > 0) {
      toast.error(
        "This product already has a video type item. Only one video type is allowed per product."
      );
      return;
    }

    if (formData.type === "text" && existingTextItems.length > 0) {
      toast.error(
        "This product already has a text type item. Only one text type is allowed per product."
      );
      return;
    }

    setSubmitting(true);

    try {
      let finalFormData = { ...formData };

      // If it's an image type, upload the images first
      if (formData.type === "image" && multiImageUploadRef.current) {
        try {
          // Check if there are images to upload
          const hasImagesToUpload = formData.images.some((img) => img.file);
          if (hasImagesToUpload) {
            toast.loading("Uploading images to Cloudinary...");
          }

          const uploadedImages =
            await multiImageUploadRef.current.uploadAllImages();
          console.log("Uploaded images:", uploadedImages);

          if (!uploadedImages || uploadedImages.length === 0) {
            toast.error(
              "No images to upload. Please select at least one image."
            );
            setSubmitting(false);
            return;
          }

          if (hasImagesToUpload) {
            toast.dismiss(); // Remove loading toast
            toast.success("Images uploaded successfully!");
          }

          finalFormData.images = uploadedImages;
          console.log("Final form data being sent:", finalFormData);
        } catch (uploadError) {
          console.error("Upload error:", uploadError);
          toast.error(
            "Failed to upload images: " +
              (uploadError.message || "Unknown error")
          );
          setSubmitting(false);
          return;
        }
      }

      // If it's a video type, upload the videos first
      if (formData.type === "video" && multiVideoUploadRef.current) {
        try {
          // Check if there are videos to upload
          const hasVideosToUpload = formData.videos.some((vid) => vid.file);
          if (hasVideosToUpload) {
            toast.loading("Uploading videos to Cloudinary...");
          }

          const uploadedVideos =
            await multiVideoUploadRef.current.uploadAllVideos();
          console.log("Uploaded videos:", uploadedVideos);

          if (!uploadedVideos || uploadedVideos.length === 0) {
            toast.error(
              "No videos to upload. Please select at least one video."
            );
            setSubmitting(false);
            return;
          }

          if (hasVideosToUpload) {
            toast.dismiss(); // Remove loading toast
            toast.success("Videos uploaded successfully!");
          }

          finalFormData.videos = uploadedVideos;
          console.log("Final form data being sent:", finalFormData);
        } catch (uploadError) {
          console.error("Upload error:", uploadError);
          toast.error(
            "Failed to upload videos: " +
              (uploadError.message || "Unknown error")
          );
          setSubmitting(false);
          return;
        }
      }

      const url = editingItem
        ? `/api/admin/product-inner/${editingItem._id}`
        : "/api/admin/product-inner";

      const method = editingItem ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(finalFormData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(
          `Product inner item ${
            editingItem ? "updated" : "created"
          } successfully`
        );

        setDialogOpen(false);
        setEditingItem(null);
        resetForm();
        fetchProductInners();
      } else {
        toast.error(
          data.error ||
            `Failed to ${editingItem ? "update" : "create"} product inner item`
        );
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      type: item.type,
      images: item.images || [],
      videos: item.videos || [],
      description: item.description || "",
      buttonText: item.buttonText || "",
      link: item.link || "",
      isActive: item.isActive,
      order: item.order,
      productId: item.productId?._id || item.productId || "",
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    try {
      const response = await fetch(`/api/admin/product-inner/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Product inner item deleted successfully");
        fetchProductInners();
      } else {
        toast.error(data.error || "Failed to delete product inner item");
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      toast.error("Failed to delete product inner item");
    }
  };

  const resetForm = () => {
    setFormData({
      type: "image",
      images: [],
      videos: [],
      description: "",
      buttonText: "",
      link: "",
      isActive: true,
      order: 0,
      productId: selectedProduct || "",
    });

    // Clear any existing image and video previews
    if (multiImageUploadRef.current) {
      multiImageUploadRef.current.clearPreviews &&
        multiImageUploadRef.current.clearPreviews();
    }
    if (multiVideoUploadRef.current) {
      multiVideoUploadRef.current.clearPreviews &&
        multiVideoUploadRef.current.clearPreviews();
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImagesChange = (images) => {
    // Filter out any invalid images
    const validImages = images.filter(
      (img) => img && (img.url || img.preview || img.file)
    );

    setFormData((prev) => ({
      ...prev,
      images: validImages,
    }));
  };

  const handleVideosChange = (videos) => {
    // Filter out any invalid videos
    const validVideos = videos.filter(
      (vid) => vid && (vid.url || vid.preview || vid.file)
    );

    setFormData((prev) => ({
      ...prev,
      videos: validVideos,
    }));
  };

  const handleTypeChange = (type) => {
    setFormData((prev) => ({
      ...prev,
      type,
      // Reset type-specific fields when changing type
      images: type === "image" ? prev.images : [],
      videos: type === "video" ? prev.videos : [],
      description: type === "text" ? prev.description : "",
      buttonText: type === "text" ? prev.buttonText : "",
      link: type === "text" ? prev.link : "",
    }));
  };

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            Product Inner Items
          </h1>
          <p className="text-muted-foreground text-base sm:text-base">
            Manage product inner content items (images and text blocks)
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingItem(null);
                resetForm();
              }}
              className="w-full sm:w-auto"
            >
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Add New Item</span>
              <span className="sm:hidden">Add Item</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto z-[50]">
            <DialogHeader>
              <DialogTitle>
                {editingItem
                  ? "Edit Product Inner Item"
                  : "Add New Product Inner Item"}
              </DialogTitle>
              <DialogDescription>
                Create or edit product inner content items. Choose between image
                or text content.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              {/* Product Selection */}
              <div className="space-y-2">
                <Label htmlFor="productId">Product *</Label>
                <Select
                  value={formData.productId}
                  onValueChange={(value) =>
                    handleInputChange("productId", value)
                  }
                  disabled={productsLoading}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        productsLoading
                          ? "Loading products..."
                          : "Select a product"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product._id} value={product._id}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Type Selection */}
              <div className="space-y-2">
                <Label htmlFor="type">Content Type</Label>
                <Select value={formData.type} onValueChange={handleTypeChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select content type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="image">Image</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="text">Text Block</SelectItem>
                  </SelectContent>
                </Select>

                {/* Validation Warning */}
                {formData.productId && (
                  <div className="text-base text-muted-foreground bg-gray-50 p-3 rounded-lg">
                    {(() => {
                      const itemsForProduct = productInners.filter((item) => {
                        const itemProductId =
                          typeof item.productId === "object"
                            ? item.productId._id
                            : item.productId;
                        return itemProductId === formData.productId;
                      });
                      // If editing, exclude the current item from validation
                      const otherItemsForProduct = editingItem
                        ? itemsForProduct.filter(
                            (item) => item._id !== editingItem._id
                          )
                        : itemsForProduct;

                      const existingImageItems = otherItemsForProduct.filter(
                        (item) => item.type === "image"
                      );
                      const existingVideoItems = otherItemsForProduct.filter(
                        (item) => item.type === "video"
                      );
                      const existingTextItems = otherItemsForProduct.filter(
                        (item) => item.type === "text"
                      );

                      return (
                        <div>
                          <div className="font-medium text-gray-700 mb-1">
                            Current items for this product:
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center">
                              <ImageIcon className="h-3 w-3 mr-1" />
                              <span
                                className={
                                  existingImageItems.length > 0
                                    ? "text-gray-700"
                                    : "text-gray-500"
                                }
                              >
                                Image:{" "}
                                {existingImageItems.length > 0
                                  ? "✓ Already exists"
                                  : "Not added yet"}
                              </span>
                              {formData.type === "image" &&
                                existingImageItems.length > 0 && (
                                  <span className="ml-2 text-gray-600 text-base">
                                    (Duplicate not allowed)
                                  </span>
                                )}
                            </div>
                            <div className="flex items-center">
                              <VideoIcon className="h-3 w-3 mr-1" />
                              <span
                                className={
                                  existingVideoItems.length > 0
                                    ? "text-gray-700"
                                    : "text-gray-500"
                                }
                              >
                                Video:{" "}
                                {existingVideoItems.length > 0
                                  ? "✓ Already exists"
                                  : "Not added yet"}
                              </span>
                              {formData.type === "video" &&
                                existingVideoItems.length > 0 && (
                                  <span className="ml-2 text-gray-600 text-base">
                                    (Duplicate not allowed)
                                  </span>
                                )}
                            </div>
                            <div className="flex items-center">
                              <Type className="h-3 w-3 mr-1" />
                              <span
                                className={
                                  existingTextItems.length > 0
                                    ? "text-gray-700"
                                    : "text-gray-500"
                                }
                              >
                                Text:{" "}
                                {existingTextItems.length > 0
                                  ? "✓ Already exists"
                                  : "Not added yet"}
                              </span>
                              {formData.type === "text" &&
                                existingTextItems.length > 0 && (
                                  <span className="ml-2 text-gray-600 text-base">
                                    (Duplicate not allowed)
                                  </span>
                                )}
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>

              {/* Image Type Fields */}
              {formData.type === "image" && (
                <div className="space-y-2">
                  <Label>Product Images (Max 3)</Label>
                  <MultiImageUpload
                    ref={multiImageUploadRef}
                    value={formData.images}
                    onChange={handleImagesChange}
                    folder="product-inner"
                    maxImages={3}
                  />
                </div>
              )}

              {/* Video Type Fields */}
              {formData.type === "video" && (
                <div className="space-y-2">
                  <Label>Product Videos (Max 2)</Label>
                  <MultiVideoUpload
                    ref={multiVideoUploadRef}
                    value={formData.videos}
                    onChange={handleVideosChange}
                    folder="product-inner"
                    maxVideos={2}
                  />
                </div>
              )}

              {/* Text Type Fields */}
              {formData.type === "text" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        handleInputChange("description", e.target.value)
                      }
                      placeholder="Enter description text"
                      rows={3}
                      maxLength={500}
                    />
                    <p className="text-base text-muted-foreground">
                      {formData.description.length}/500 characters
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="buttonText">Button Text</Label>
                    <Input
                      id="buttonText"
                      value={formData.buttonText}
                      onChange={(e) =>
                        handleInputChange("buttonText", e.target.value)
                      }
                      placeholder="e.g., view collection"
                      maxLength={50}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="link">Link</Label>
                    <Input
                      id="link"
                      value={formData.link}
                      onChange={(e) =>
                        handleInputChange("link", e.target.value)
                      }
                      placeholder="e.g., /store"
                      maxLength={200}
                    />
                  </div>
                </>
              )}

              {/* Common Fields */}
              <div className="space-y-2">
                <Label htmlFor="order">Order</Label>
                <Input
                  id="order"
                  type="number"
                  value={formData.order}
                  onChange={(e) =>
                    handleInputChange("order", parseInt(e.target.value) || 0)
                  }
                  placeholder="Display order"
                  min={0}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    handleInputChange("isActive", checked)
                  }
                />
                <Label htmlFor="isActive">Active</Label>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting
                    ? "Saving..."
                    : editingItem
                    ? "Update Item"
                    : "Create Item"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{productInners.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium">Image Items</CardTitle>
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {productInners.filter((item) => item.type === "image").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium">Video Items</CardTitle>
            <VideoIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {productInners.filter((item) => item.type === "video").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium">Text Items</CardTitle>
            <Type className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {productInners.filter((item) => item.type === "text").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Product Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Filter by Product</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
            <div className="flex-1">
              <Select
                value={selectedProduct}
                onValueChange={setSelectedProduct}
                disabled={productsLoading}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      productsLoading
                        ? "Loading products..."
                        : "Select a product to filter"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product._id} value={product._id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {(selectedProduct || products.length > 0) && (
              <Button
                variant="outline"
                onClick={() => setSelectedProduct("")}
                size="sm"
                disabled={!selectedProduct}
                className="w-full sm:w-auto"
              >
                {selectedProduct ? "Clear Filter" : "Show All"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Product Inner Items Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Product Inner Items
            {selectedProduct &&
              products.find((p) => p._id === selectedProduct) &&
              ` - ${products.find((p) => p._id === selectedProduct).name}`}
          </CardTitle>

          {/* Validation Summary */}
          {selectedProduct && productInners.length > 0 && (
            <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="text-base font-medium text-gray-800 mb-2">
                Current item types for this product:
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                {(() => {
                  const itemsForProduct = productInners.filter((item) => {
                    const itemProductId =
                      typeof item.productId === "object"
                        ? item.productId._id
                        : item.productId;
                    return itemProductId === selectedProduct;
                  });
                  const imageItems = itemsForProduct.filter(
                    (item) => item.type === "image"
                  );
                  const videoItems = itemsForProduct.filter(
                    (item) => item.type === "video"
                  );
                  const textItems = itemsForProduct.filter(
                    (item) => item.type === "text"
                  );

                  return (
                    <>
                      <div className="flex items-center">
                        <ImageIcon className="h-4 w-4 mr-1 text-gray-600" />
                        <span className="text-base text-gray-700">
                          Image: {imageItems.length}/1{" "}
                          {imageItems.length >= 1 ? "✓" : ""}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <VideoIcon className="h-4 w-4 mr-1 text-gray-600" />
                        <span className="text-base text-gray-700">
                          Video: {videoItems.length}/1{" "}
                          {videoItems.length >= 1 ? "✓" : ""}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Type className="h-4 w-4 mr-1 text-gray-600" />
                        <span className="text-base text-gray-700">
                          Text: {textItems.length}/1{" "}
                          {textItems.length >= 1 ? "✓" : ""}
                        </span>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="text-base text-muted-foreground">Loading...</div>
            </div>
          ) : productInners.length === 0 ? (
            <div className="text-center py-8">
              <Package className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-base font-semibold text-gray-900">
                No items found
              </h3>
              <p className="mt-1 text-base text-muted-foreground">
                Get started by creating your first product inner item.
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Content</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="w-[70px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {productInners.map((item) => (
                      <TableRow key={item._id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <GripVertical className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{item.order}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-base">
                            {item.productId?.name || "Unknown Product"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {item.type === "image" ? (
                              <ImageIcon className="h-4 w-4" />
                            ) : item.type === "video" ? (
                              <VideoIcon className="h-4 w-4" />
                            ) : (
                              <Type className="h-4 w-4" />
                            )}
                            <Badge
                              variant={
                                item.type === "image" || item.type === "video"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {item.type}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          {item.type === "image" ? (
                            <div className="flex items-center gap-2">
                              <div className="flex -space-x-2">
                                {item.images?.slice(0, 3).map((image, idx) => (
                                  <Image
                                    key={idx}
                                    src={image.url}
                                    alt={`Product inner ${idx + 1}`}
                                    width={32}
                                    height={32}
                                    className="h-8 w-8 object-cover rounded border-2 border-white"
                                  />
                                ))}
                              </div>
                              <span className="text-base text-muted-foreground">
                                {item.images?.length || 0} image(s)
                              </span>
                            </div>
                          ) : item.type === "video" ? (
                            <div className="flex items-center gap-2">
                              <div className="flex -space-x-2">
                                {item.videos?.slice(0, 2).map((video, idx) => (
                                  <div
                                    key={idx}
                                    className="h-8 w-8 bg-gray-100 rounded border-2 border-white flex items-center justify-center"
                                  >
                                    <VideoIcon className="h-4 w-4 text-gray-600" />
                                  </div>
                                ))}
                              </div>
                              <span className="text-base text-muted-foreground">
                                {item.videos?.length || 0} video(s)
                              </span>
                            </div>
                          ) : (
                            <div className="space-y-1">
                              <p className="text-base truncate max-w-xs">
                                {item.description}
                              </p>
                              {item.buttonText && (
                                <Badge variant="outline" className="text-base">
                                  {item.buttonText}
                                </Badge>
                              )}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={item.isActive ? "default" : "secondary"}
                          >
                            {item.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-base text-muted-foreground">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleEdit(item)}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDelete(item._id)}
                                className="text-gray-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-4">
                {productInners.map((item) => (
                  <Card key={item._id} className="p-4">
                    <div className="space-y-3">
                      {/* Header with Order and Actions */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <GripVertical className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium text-base">
                            Order: {item.order}
                          </span>
                          <Badge
                            variant={item.isActive ? "default" : "secondary"}
                            className="text-base"
                          >
                            {item.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(item)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(item._id)}
                              className="text-gray-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {/* Product Name */}
                      <div>
                        <div className="text-base font-medium">
                          {item.productId?.name || "Unknown Product"}
                        </div>
                        <div className="text-base text-muted-foreground">
                          Created:{" "}
                          {new Date(item.createdAt).toLocaleDateString()}
                        </div>
                      </div>

                      {/* Type Badge */}
                      <div className="flex items-center gap-2">
                        {item.type === "image" ? (
                          <ImageIcon className="h-4 w-4" />
                        ) : item.type === "video" ? (
                          <VideoIcon className="h-4 w-4" />
                        ) : (
                          <Type className="h-4 w-4" />
                        )}
                        <Badge
                          variant={
                            item.type === "image" || item.type === "video"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {item.type}
                        </Badge>
                      </div>

                      {/* Content */}
                      <div>
                        {item.type === "image" ? (
                          <div className="space-y-2">
                            <div className="flex flex-wrap gap-2">
                              {item.images?.slice(0, 4).map((image, idx) => (
                                <Image
                                  key={idx}
                                  src={image.url}
                                  alt={`Product inner ${idx + 1}`}
                                  width={60}
                                  height={60}
                                  className="h-15 w-15 object-cover rounded border"
                                />
                              ))}
                            </div>
                            <p className="text-base text-muted-foreground">
                              {item.images?.length || 0} image
                              {(item.images?.length || 0) !== 1 ? "s" : ""}
                            </p>
                          </div>
                        ) : item.type === "video" ? (
                          <div className="space-y-2">
                            <div className="flex flex-wrap gap-2">
                              {item.videos?.slice(0, 2).map((video, idx) => (
                                <div
                                  key={idx}
                                  className="h-15 w-15 bg-gray-100 rounded border flex items-center justify-center"
                                >
                                  <VideoIcon className="h-6 w-6 text-gray-600" />
                                </div>
                              ))}
                            </div>
                            <p className="text-base text-muted-foreground">
                              {item.videos?.length || 0} video
                              {(item.videos?.length || 0) !== 1 ? "s" : ""}
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <p className="text-base">{item.description}</p>
                            {item.buttonText && (
                              <p className="text-base text-muted-foreground">
                                Button: {item.buttonText}
                              </p>
                            )}
                            {item.link && (
                              <p className="text-base text-muted-foreground truncate">
                                Link: {item.link}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          )}

          {/* Pagination Controls */}
          {!loading && totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between mt-6 pt-4 border-t gap-4">
              <div className="text-base text-muted-foreground order-2 sm:order-1">
                Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                {Math.min(currentPage * itemsPerPage, totalItems)} of{" "}
                {totalItems} items
              </div>
              <div className="flex items-center gap-2 order-1 sm:order-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                  className="flex items-center"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>

                <div className="text-base text-muted-foreground px-3">
                  Page {currentPage} of {totalPages}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="flex items-center"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
