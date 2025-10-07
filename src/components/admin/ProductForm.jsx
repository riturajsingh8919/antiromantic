"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Upload,
  X,
  Plus,
  Trash2,
  IndianRupee,
  Search,
  Image as ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { slugify } from "@/lib/utils-admin";

const sizeStockSchema = z.object({
  size: z.enum(["XS", "S", "M", "L", "XL", "XXL"]),
  stock: z.number().min(0, "Stock must be positive"),
});

// Dynamic product form schema that will be created based on available categories
const createProductFormSchema = (availableCategories) => {
  const categoryValues =
    availableCategories.length > 0
      ? availableCategories.map((cat) => cat.slug)
      : ["default"]; // Changed from "no-categories" to "default" for better fallback

  return z.object({
    name: z
      .string()
      .min(1, "Product name is required")
      .max(200, "Product name cannot exceed 200 characters"),
    slug: z
      .string()
      .min(1, "Slug is required")
      .max(100, "Slug cannot exceed 100 characters"),
    description: z
      .string()
      .min(1, "Description is required")
      .max(2000, "Description cannot exceed 2000 characters"),
    shortDescription: z
      .string()
      .max(500, "Short description cannot exceed 500 characters")
      .optional(),
    category: z.enum(categoryValues, {
      required_error: "Please select a category",
    }),
    colorName: z
      .string()
      .min(1, "Color name is required")
      .max(100, "Color name cannot exceed 100 characters"),
    material: z
      .string()
      .min(1, "Material is required")
      .max(200, "Material cannot exceed 200 characters"),
    careInstructions: z
      .string()
      .max(1000, "Care instructions cannot exceed 1000 characters")
      .optional(),
    price: z.number().min(0, "Price must be positive"),
    comparePrice: z
      .number()
      .min(0, "Compare price must be positive")
      .optional(),
    sizeStock: z
      .array(sizeStockSchema)
      .min(1, "At least one size must be added"),
    lowStockThreshold: z
      .number()
      .min(0, "Low stock threshold must be positive")
      .default(5),
    status: z
      .enum(["draft", "active", "inactive", "out_of_stock"])
      .default("draft"),
    isFeatured: z.boolean().default(false),
    weight: z.number().min(0, "Weight must be positive").optional(),
    shippingClass: z
      .enum(["standard", "express", "fragile", "special"])
      .default("standard"),
    requiresSpecialHandling: z.boolean().default(false),
    estimatedDeliveryDays: z
      .number()
      .min(1, "Delivery days must be at least 1")
      .default(7),
    sizeGuide: z
      .object({
        bulletPoints: z
          .array(
            z
              .string()
              .min(1, "Bullet point cannot be empty")
              .max(200, "Bullet point cannot exceed 200 characters")
          )
          .optional(),
        image: z.string().optional(),
      })
      .optional(),
    faqSection: z
      .array(
        z.object({
          question: z
            .string()
            .min(1, "Question cannot be empty")
            .max(200, "Question cannot exceed 200 characters"),
          answer: z
            .string()
            .min(1, "Answer cannot be empty")
            .max(1000, "Answer cannot exceed 1000 characters"),
        })
      )
      .optional(),
    customerSupportNotes: z
      .array(
        z
          .string()
          .min(1, "Note cannot be empty")
          .max(300, "Note cannot exceed 300 characters")
      )
      .optional(),
    metaTitle: z
      .string()
      .max(60, "Meta title cannot exceed 60 characters")
      .optional(),
    metaDescription: z
      .string()
      .max(160, "Meta description cannot exceed 160 characters")
      .optional(),
  });
};

const sizes = ["XS", "S", "M", "L", "XL", "XXL"];

export function ProductForm({ product, isEdit = false }) {
  const router = useRouter();
  const [images, setImages] = useState(product?.images || []);
  const [sizeGuideImage, setSizeGuideImage] = useState(
    product?.sizeGuide?.image || null
  );
  const [uploading, setUploading] = useState(false);
  const [sizeGuideUploading, setSizeGuideUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageError, setImageError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [mediaLibraryImages, setMediaLibraryImages] = useState([]);
  const [mediaLibraryLoading, setMediaLibraryLoading] = useState(false);
  const [mediaSearchQuery, setMediaSearchQuery] = useState("");

  // Size Guide Media Library States
  const [showSizeGuideMediaLibrary, setShowSizeGuideMediaLibrary] =
    useState(false);
  const [sizeGuideMediaSearchQuery, setSizeGuideMediaSearchQuery] =
    useState("");

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        const response = await fetch("/api/admin/categories");
        const data = await response.json();
        if (data.success) {
          // Only get active categories
          const activeCategories = data.data.filter((cat) => cat.isActive);
          setCategories(activeCategories);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        setCategories([]);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const form = useForm({
    resolver: zodResolver(createProductFormSchema(categories)),
    mode: "onChange", // Enable real-time validation
    defaultValues: {
      name: product?.name || "",
      slug: product?.slug || "",
      description: product?.description || "",
      shortDescription: product?.shortDescription || "",
      category:
        product?.category || (categories.length > 0 ? categories[0].slug : ""),
      colorName: product?.colorName || "",
      material: product?.material || "",
      careInstructions: product?.careInstructions || "",
      price: product?.price || 0,
      comparePrice: product?.comparePrice || 0,
      sizeStock: product?.sizeStock || [],
      lowStockThreshold: product?.lowStockThreshold || 5,
      status: product?.status || "draft",
      isFeatured: product?.isFeatured || false,
      weight: product?.weight || 0,
      shippingClass: product?.shippingClass || "standard",
      requiresSpecialHandling: product?.requiresSpecialHandling || false,
      estimatedDeliveryDays: product?.estimatedDeliveryDays || 7,
      sizeGuide: product?.sizeGuide || { bulletPoints: [], image: "" },
      faqSection: product?.faqSection || [],
      customerSupportNotes: product?.customerSupportNotes || [],
      metaTitle: product?.metaTitle || "",
      metaDescription: product?.metaDescription || "",
    },
  });

  // Update form when categories are loaded
  useEffect(() => {
    if (categories.length > 0) {
      // Re-initialize the form with the new schema
      const newSchema = createProductFormSchema(categories);
      form.reset(form.getValues(), {
        resolver: zodResolver(newSchema),
      });
    }
  }, [categories, form]);

  // Initialize size guide image from product data in edit mode
  useEffect(() => {
    if (product?.sizeGuide?.image) {
      // If it's a full URL, assume it's already uploaded
      if (product.sizeGuide.image.startsWith("http")) {
        setSizeGuideImage({
          url: product.sizeGuide.image,
          publicId: null, // We don't have publicId for existing images
        });
      }
    }
  }, [product]);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "sizeStock",
  });

  // Watch name field to auto-generate slug
  const watchName = form.watch("name");
  useEffect(() => {
    if (watchName && !isEdit) {
      form.setValue("slug", slugify(watchName));
    }
  }, [watchName, form, isEdit]);

  // Debug images changes
  useEffect(() => {
    console.log("Images state updated:", images);
  }, [images]);

  // Handle drag and drop
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleImageUploadFiles(files);
    }
  };

  const handleImageUploadFiles = async (files) => {
    // Clear previous upload error
    setUploadError("");

    for (const file of files) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setUploadError(`File ${file.name} is too large. Maximum size is 5MB.`);
        continue;
      }

      // Validate file type
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
      ];
      if (!allowedTypes.includes(file.type)) {
        setUploadError(
          `File ${file.name} is not supported. Please use JPG, PNG, or WEBP.`
        );
        continue;
      }

      setUploading(true);

      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", "products");

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();
        console.log("Upload response:", data);

        if (response.ok && data.success && data.data) {
          const newImage = {
            url: data.data.secure_url || data.data.url,
            publicId: data.data.public_id || data.data.publicId,
            alt: "",
          };

          console.log("Adding image to state:", newImage);

          setImages((prev) => {
            const updated = [...prev, newImage];
            console.log("Updated images array:", updated);
            return updated;
          });

          // Clear errors when image is successfully uploaded
          setImageError("");
          setUploadError("");

          console.log("Image successfully added");
        } else {
          const errorMessage = data.error || data.message || "Upload failed";
          console.error("Upload failed:", errorMessage, data);
          setUploadError(`Upload failed: ${errorMessage}`);
        }
      } catch (error) {
        console.error("Error uploading image:", error);
        setUploadError(`Error uploading image: ${error.message}`);
      } finally {
        setUploading(false);
      }
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    handleImageUploadFiles(files);
  };

  const handleImageDelete = async (publicId, index) => {
    try {
      const response = await fetch("/api/upload", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicId }),
      });

      if (response.ok) {
        setImages((prev) => prev.filter((_, i) => i !== index));
      }
    } catch (error) {
      console.error("Error deleting image:", error);
    }
  };

  // Size Guide Image Upload Handlers
  const handleSizeGuideImageUpload = async (files) => {
    const file = files[0]; // Only allow one size guide image
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Size guide image is too large. Maximum size is 5MB.");
      return;
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setUploadError(
        "Size guide image format not supported. Please use JPG, PNG, or WEBP."
      );
      return;
    }

    setSizeGuideUploading(true);
    setUploadError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "size-guides");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.success && data.data) {
        const newImage = {
          url: data.data.secure_url || data.data.url,
          publicId: data.data.public_id || data.data.publicId,
        };

        setSizeGuideImage(newImage);

        // Update form field
        form.setValue("sizeGuide.image", newImage.url);

        setUploadError("");
      } else {
        const errorMessage =
          data.error || data.message || "Size guide upload failed";
        setUploadError(`Size guide upload failed: ${errorMessage}`);
      }
    } catch (error) {
      console.error("Error uploading size guide image:", error);
      setUploadError(`Error uploading size guide image: ${error.message}`);
    } finally {
      setSizeGuideUploading(false);
    }
  };

  const handleSizeGuideImageDelete = async () => {
    if (!sizeGuideImage?.publicId) {
      setSizeGuideImage(null);
      form.setValue("sizeGuide.image", "");
      return;
    }

    try {
      const response = await fetch("/api/upload", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicId: sizeGuideImage.publicId }),
      });

      if (response.ok) {
        setSizeGuideImage(null);
        form.setValue("sizeGuide.image", "");
      }
    } catch (error) {
      console.error("Error deleting size guide image:", error);
    }
  };

  const handleSizeGuideDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleSizeGuideDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleSizeGuideDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleSizeGuideImageUpload(files);
    }
  };

  const addSizeStock = () => {
    append({ size: "S", stock: 0 });
  };

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
    // Check if image is already selected
    const isAlreadySelected = images.some(
      (img) => img.publicId === libraryImage.publicId
    );
    if (isAlreadySelected) {
      setUploadError("This image is already selected.");
      return;
    }

    const newImage = {
      url: libraryImage.url,
      publicId: libraryImage.publicId,
      alt: libraryImage.alt || "",
    };

    setImages((prev) => [...prev, newImage]);
    setImageError("");
    setUploadError("");
    setShowMediaLibrary(false);
  };

  // Filter media library images based on search query
  const filteredMediaImages = mediaLibraryImages.filter(
    (image) =>
      image.alt?.toLowerCase().includes(mediaSearchQuery.toLowerCase()) ||
      image.publicId?.toLowerCase().includes(mediaSearchQuery.toLowerCase()) ||
      image.folder?.toLowerCase().includes(mediaSearchQuery.toLowerCase())
  );

  // Filter size guide media library images based on search query
  const filteredSizeGuideMediaImages = mediaLibraryImages.filter(
    (image) =>
      image.alt
        ?.toLowerCase()
        .includes(sizeGuideMediaSearchQuery.toLowerCase()) ||
      image.publicId
        ?.toLowerCase()
        .includes(sizeGuideMediaSearchQuery.toLowerCase()) ||
      image.folder
        ?.toLowerCase()
        .includes(sizeGuideMediaSearchQuery.toLowerCase())
  );

  const onSubmit = async (data) => {
    console.log("onSubmit called with data:", data);
    console.log("Current images state:", images);

    // Clear previous errors
    setImageError("");
    setSubmitError("");

    // Validate images
    const validImages = images.filter((img) => img && img.url && img.publicId);
    console.log("Valid images:", validImages);

    if (validImages.length === 0) {
      console.log("No valid images found, setting error");
      setImageError(
        "At least one product image is required. Please upload an image before submitting."
      );
      // Scroll to top to show the error
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setLoading(true);

    try {
      const productData = {
        ...data,
        images: validImages,
      };

      console.log("Submitting product data:", productData);

      const url = isEdit
        ? `/api/admin/products/${product._id}`
        : "/api/admin/products";
      const method = isEdit ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      });

      const result = await response.json();
      console.log("Product save response:", result);

      if (result.success) {
        alert(`Product ${isEdit ? "updated" : "created"} successfully!`);
        router.push("/admin/products");
        router.refresh();
      } else {
        console.error("Save failed:", result);
        console.error("Validation details:", result.details);

        // Handle validation errors specifically
        if (result.error === "Validation error" && result.details) {
          // Format validation errors for display
          const validationErrors = [];
          if (typeof result.details === "object") {
            Object.entries(result.details).forEach(([field, error]) => {
              if (typeof error === "object" && error.message) {
                validationErrors.push(`${field}: ${error.message}`);
              } else if (typeof error === "string") {
                validationErrors.push(`${field}: ${error}`);
              } else if (Array.isArray(error)) {
                error.forEach((err) => {
                  if (typeof err === "object" && err.message) {
                    validationErrors.push(`${field}: ${err.message}`);
                  } else {
                    validationErrors.push(`${field}: ${err}`);
                  }
                });
              }
            });
          }

          if (validationErrors.length > 0) {
            setSubmitError(
              `Validation errors:\n${validationErrors.join("\n")}`
            );
          } else {
            setSubmitError(
              "Please check all required fields and fix any validation errors."
            );
          }
        } else if (result.error && typeof result.error === "string") {
          if (result.error.includes("validation failed")) {
            setSubmitError(
              "Please check all required fields and fix any validation errors."
            );
          } else {
            setSubmitError(result.error);
          }
        } else {
          setSubmitError(
            result.message || "Error saving product. Please try again."
          );
        }

        // Scroll to top to show error
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setSubmitError(
        "Network error: Unable to save product. Please check your connection and try again."
      );
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="container mx-auto p-6"
      style={{ backgroundColor: "#efece3" }}
    >
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {isEdit ? "Edit Product" : "Add New Product"}
        </h1>
        <p className="text-gray-600">
          {isEdit
            ? "Update product information"
            : "Create a new product for your store"}
        </p>
      </div>

      <Form {...form}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            console.log("Form submission intercepted");

            // Check images before calling handleSubmit
            if (images.length === 0) {
              console.log("No images, setting error");
              setImageError(
                "At least one product image is required. Please upload an image before submitting."
              );
              window.scrollTo({ top: 0, behavior: "smooth" });
              return;
            }

            // If images exist, proceed with react-hook-form validation
            form.handleSubmit(onSubmit)(e);
          }}
          className="space-y-6"
        >
          {/* Global Error Message */}
          {submitError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-base font-medium text-gray-800">
                    Error saving product
                  </h3>
                  <div className="mt-2 text-base text-gray-700">
                    {submitError.includes("\n") ? (
                      <pre className="whitespace-pre-wrap font-sans">
                        {submitError}
                      </pre>
                    ) : (
                      <p>{submitError}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Basic Information */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="bg-gray-50 border-b">
              <CardTitle className="text-lg text-gray-900">
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium">
                        Product Name *
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter product name"
                          {...field}
                          className="border-gray-300 focus:border-gray-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium">
                        Slug
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="product-slug"
                          {...field}
                          className="border-gray-300 focus:border-gray-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => {
                  const currentLength = field.value?.length || 0;
                  const maxLength = 2000;
                  const isNearLimit = currentLength > maxLength * 0.8;
                  const isOverLimit = currentLength > maxLength;

                  return (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium">
                        Description *
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Detailed product description"
                          rows={4}
                          {...field}
                          className={`border-gray-300 focus:border-gray-500 ${
                            isOverLimit
                              ? "border-red-300 focus:border-red-500"
                              : ""
                          }`}
                        />
                      </FormControl>
                      <div className="flex justify-between items-center mt-1">
                        <FormMessage />
                        <span
                          className={`text-base ${
                            isOverLimit
                              ? "text-gray-500"
                              : isNearLimit
                              ? "text-orange-500"
                              : "text-gray-500"
                          }`}
                        >
                          {currentLength}/{maxLength}
                        </span>
                      </div>
                    </FormItem>
                  );
                }}
              />{" "}
              <FormField
                control={form.control}
                name="shortDescription"
                render={({ field }) => {
                  const currentLength = field.value?.length || 0;
                  const maxLength = 500;
                  const isNearLimit = currentLength > maxLength * 0.8;
                  const isOverLimit = currentLength > maxLength;

                  return (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium">
                        Short Description
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Brief product summary"
                          rows={2}
                          {...field}
                          className={`border-gray-300 focus:border-gray-500 ${
                            isOverLimit
                              ? "border-red-300 focus:border-red-500"
                              : ""
                          }`}
                        />
                      </FormControl>
                      <div className="flex justify-between items-center mt-1">
                        <FormMessage />
                        <span
                          className={`text-base ${
                            isOverLimit
                              ? "text-gray-500"
                              : isNearLimit
                              ? "text-orange-500"
                              : "text-gray-500"
                          }`}
                        >
                          {currentLength}/{maxLength}
                        </span>
                      </div>
                    </FormItem>
                  );
                }}
              />
            </CardContent>
          </Card>

          {/* Category & Color */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="bg-gray-50 border-b">
              <CardTitle className="text-lg text-gray-900">
                Category & Color
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium">
                        Category *
                      </FormLabel>
                      {categoriesLoading ? (
                        <div className="border-gray-300 border rounded-md px-3 py-2 bg-gray-50">
                          Loading categories...
                        </div>
                      ) : categories.length === 0 ? (
                        <div className="space-y-2">
                          <div className="border-gray-300 border rounded-md px-3 py-2 bg-red-50 text-gray-700">
                            No categories available. Please add categories
                            first.
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => router.push("/admin/categories")}
                            className="w-full"
                          >
                            Go to Categories Management
                          </Button>
                        </div>
                      ) : (
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={categories.length === 0}
                        >
                          <FormControl>
                            <SelectTrigger className="border-gray-300 focus:border-gray-500">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem
                                key={category.slug}
                                value={category.slug}
                              >
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="colorName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium">
                        Color Name *
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Light Beige, Solid Color"
                          {...field}
                          className="border-gray-300 focus:border-gray-500"
                        />
                      </FormControl>
                      <FormDescription className="text-gray-500">
                        As shown in the product image (e.g., "light beige, solid
                        color")
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Product Images */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="bg-gray-50 border-b">
              <CardTitle className="text-lg text-gray-900">
                Product Images *
              </CardTitle>
              {imageError && (
                <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-base text-gray-600 font-medium">
                    {imageError}
                  </p>
                </div>
              )}
              {uploadError && (
                <div className="mt-2 p-3 bg-orange-50 border border-orange-200 rounded-md">
                  <p className="text-base text-orange-600 font-medium">
                    {uploadError}
                  </p>
                </div>
              )}
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {/* Upload Options */}
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Upload New Images */}
                  <div className="flex-1">
                    <div
                      className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                        isDragOver
                          ? "border-blue-400 bg-blue-50"
                          : uploading
                          ? "border-gray-400 bg-gray-50"
                          : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                      }`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() =>
                        document.getElementById("image-upload").click()
                      }
                    >
                      <Upload
                        className={`mx-auto h-12 w-12 mb-4 ${
                          isDragOver ? "text-blue-500" : "text-gray-400"
                        }`}
                      />
                      <div className="text-base text-gray-600 mb-4">
                        <span className="text-gray-700 font-medium">
                          {uploading ? "Uploading..." : "Click to upload new"}
                        </span>{" "}
                        or drag and drop
                        <input
                          id="image-upload"
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </div>
                      <p className="text-base text-gray-500">
                        PNG, JPG, WEBP up to 5MB each
                      </p>
                    </div>
                  </div>

                  {/* Media Library Access */}
                  <div className="flex flex-col justify-center items-center">
                    <div className="text-base text-gray-500 mb-2">OR</div>
                    <Dialog
                      open={showMediaLibrary}
                      onOpenChange={setShowMediaLibrary}
                    >
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
                      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
                        <DialogHeader>
                          <DialogTitle>Media Library</DialogTitle>
                          <DialogDescription>
                            Select images from your uploaded media library
                          </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                          {/* Search Bar */}
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                              placeholder="Search images..."
                              value={mediaSearchQuery}
                              onChange={(e) =>
                                setMediaSearchQuery(e.target.value)
                              }
                              className="pl-10"
                            />
                          </div>

                          {/* Images Grid */}
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
                                  const isSelected = images.some(
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
                                      onClick={() =>
                                        selectImageFromLibrary(image)
                                      }
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
                                      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-base p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <p className="truncate">
                                          {image.alt || image.publicId}
                                        </p>
                                      </div>
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

                {images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {images.map((image, index) => (
                      <div
                        key={`${image.publicId}-${index}`}
                        className="relative group"
                      >
                        <img
                          src={image.url}
                          alt={`Product ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border border-gray-200"
                          onError={(e) => {
                            console.error("Image failed to load:", image.url);
                            e.target.style.display = "none";
                          }}
                          onLoad={() => {
                            console.log(
                              "Image loaded successfully:",
                              image.url
                            );
                          }}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            handleImageDelete(image.publicId, index)
                          }
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {uploading && (
                  <div className="text-center py-4">
                    <div className="inline-flex items-center px-4 py-2 bg-blue-50 rounded-lg">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                      <span className="text-blue-600">Uploading image...</span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Size & Stock */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="bg-gray-50 border-b">
              <CardTitle className="text-lg text-gray-900">
                Size & Stock
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-gray-600">
                    Add available sizes and their stock quantities
                  </p>
                  <Button
                    type="button"
                    onClick={addSizeStock}
                    variant="outline"
                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Size
                  </Button>
                </div>

                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg"
                  >
                    <FormField
                      control={form.control}
                      name={`sizeStock.${index}.size`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel className="text-gray-700 font-medium">
                            Size
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="border-gray-300 focus:border-gray-500">
                                <SelectValue placeholder="Select size" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {sizes.map((size) => (
                                <SelectItem key={size} value={size}>
                                  {size}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`sizeStock.${index}.stock`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel className="text-gray-700 font-medium">
                            Stock
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              placeholder="0"
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseInt(e.target.value) || 0)
                              }
                              className="border-gray-300 focus:border-gray-500"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => remove(index)}
                      className="mt-6 border-red-300 text-gray-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="bg-gray-50 border-b">
              <CardTitle className="text-lg text-gray-900">Pricing</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium">
                        Price (INR) *
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="2,999"
                            {...field}
                            onChange={(e) => {
                              const value = e.target.value;
                              field.onChange(
                                value === "" ? "" : parseFloat(value) || 0
                              );
                            }}
                            className="pl-10 border-gray-300 focus:border-gray-500"
                          />
                        </div>
                      </FormControl>
                      <FormDescription className="text-gray-500">
                        Inclusive of all taxes
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="comparePrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium">
                        Compare at Price (INR)
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="3,999"
                            {...field}
                            onChange={(e) => {
                              const value = e.target.value;
                              field.onChange(
                                value === "" ? "" : parseFloat(value) || 0
                              );
                            }}
                            className="pl-10 border-gray-300 focus:border-gray-500"
                          />
                        </div>
                      </FormControl>
                      <FormDescription className="text-gray-500">
                        Original price before discount (optional)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Material & Care */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="bg-gray-50 border-b">
              <CardTitle className="text-lg text-gray-900">
                Material & Care
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="material"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium">
                        Material *
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., 100% Cotton, Linen"
                          {...field}
                          className="border-gray-300 focus:border-gray-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="weight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium">
                        Weight (grams)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          placeholder="250"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value) || 0)
                          }
                          className="border-gray-300 focus:border-gray-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="careInstructions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-medium">
                      Care Instructions
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., Machine wash cold, tumble dry low, do not bleach"
                        rows={3}
                        {...field}
                        className="border-gray-300 focus:border-gray-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* SEO & Settings */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="bg-gray-50 border-b">
              <CardTitle className="text-lg text-gray-900">
                SEO & Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium">
                        Status
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="border-gray-300 focus:border-gray-500">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="out_of_stock">
                            Out of Stock
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lowStockThreshold"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium">
                        Low Stock Threshold
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          placeholder="5"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value) || 0)
                          }
                          className="border-gray-300 focus:border-gray-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="isFeatured"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="border-gray-300"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-gray-700 font-medium">
                        Featured Product
                      </FormLabel>
                      <FormDescription className="text-gray-500">
                        Show this product in featured sections
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 gap-4">
                <FormField
                  control={form.control}
                  name="metaTitle"
                  render={({ field }) => {
                    const currentLength = field.value?.length || 0;
                    const maxLength = 60;
                    const isNearLimit = currentLength > maxLength * 0.8;
                    const isOverLimit = currentLength > maxLength;

                    return (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium">
                          Meta Title
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="SEO friendly title"
                            {...field}
                            className={`border-gray-300 focus:border-gray-500 ${
                              isOverLimit
                                ? "border-red-300 focus:border-red-500"
                                : ""
                            }`}
                          />
                        </FormControl>
                        <div className="flex justify-between items-center mt-1">
                          <FormMessage />
                          <span
                            className={`text-base ${
                              isOverLimit
                                ? "text-gray-500"
                                : isNearLimit
                                ? "text-orange-500"
                                : "text-gray-500"
                            }`}
                          >
                            {currentLength}/{maxLength}
                          </span>
                        </div>
                        <FormDescription className="text-gray-500">
                          Optimal length for search engines is 50-60 characters
                        </FormDescription>
                      </FormItem>
                    );
                  }}
                />

                <FormField
                  control={form.control}
                  name="metaDescription"
                  render={({ field }) => {
                    const currentLength = field.value?.length || 0;
                    const maxLength = 160;
                    const isNearLimit = currentLength > maxLength * 0.8;
                    const isOverLimit = currentLength > maxLength;

                    return (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium">
                          Meta Description
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="SEO friendly description"
                            rows={2}
                            {...field}
                            className={`border-gray-300 focus:border-gray-500 ${
                              isOverLimit
                                ? "border-red-300 focus:border-red-500"
                                : ""
                            }`}
                          />
                        </FormControl>
                        <div className="flex justify-between items-center mt-1">
                          <FormMessage />
                          <span
                            className={`text-base ${
                              isOverLimit
                                ? "text-gray-500"
                                : isNearLimit
                                ? "text-orange-500"
                                : "text-gray-500"
                            }`}
                          >
                            {currentLength}/{maxLength}
                          </span>
                        </div>
                        <FormDescription className="text-gray-500">
                          Optimal length for search engines is 150-160
                          characters
                        </FormDescription>
                      </FormItem>
                    );
                  }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Shipping Information */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="bg-gray-50 border-b">
              <CardTitle className="text-lg text-gray-900">
                Shipping Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="shippingClass"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium">
                        Shipping Class
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="border-gray-300 focus:border-gray-500">
                            <SelectValue placeholder="Select shipping class" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="standard">Standard</SelectItem>
                          <SelectItem value="express">Express</SelectItem>
                          <SelectItem value="fragile">Fragile</SelectItem>
                          <SelectItem value="special">
                            Special Handling
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="estimatedDeliveryDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium">
                        Estimated Delivery (Days)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          placeholder="7"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value))
                          }
                          className="border-gray-300 focus:border-gray-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="md:col-span-2">
                  <FormField
                    control={form.control}
                    name="requiresSpecialHandling"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-gray-700 font-medium">
                            Requires Special Handling
                          </FormLabel>
                          <FormDescription>
                            Check if this product needs special handling during
                            shipping
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Assistance */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="border-b">
              <CardTitle className="text-lg text-gray-900 flex items-center">
                <div className="w-2 h-2 bg-gray-300 rounded-full mr-3"></div>
                Customer Assistance
              </CardTitle>
              <p className="text-base text-gray-600 mt-1">
                Help customers make informed decisions with detailed product
                information
              </p>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-8">
                {/* Size Guide Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg border border-gray-300">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                        <div className="w-4 h-4 text-gray-400" />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-gray-800">
                          Size Guide
                        </h3>
                        <p className="text-base text-gray-600">
                          Help customers choose the right size
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Size Guide Image Upload */}
                  <FormField
                    control={form.control}
                    name="sizeGuide.image"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium">
                          Size Guide Image
                        </FormLabel>
                        <FormControl>
                          <div className="space-y-4">
                            {/* Upload Section */}
                            <div className="flex flex-col sm:flex-row gap-4">
                              {/* Upload Area */}
                              <div className="flex-1">
                                <div
                                  className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                                    sizeGuideUploading
                                      ? "border-gray-400 bg-gray-50"
                                      : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                                  }`}
                                  onDragOver={handleSizeGuideDragOver}
                                  onDragLeave={handleSizeGuideDragLeave}
                                  onDrop={handleSizeGuideDrop}
                                  onClick={() => {
                                    if (!sizeGuideUploading) {
                                      document
                                        .getElementById("size-guide-upload")
                                        .click();
                                    }
                                  }}
                                >
                                  <Upload className="mx-auto h-12 w-12 mb-4 text-gray-400" />
                                  <div className="text-base text-gray-600 mb-4">
                                    <span className="text-gray-700 font-medium">
                                      {sizeGuideUploading
                                        ? "Uploading..."
                                        : "Click to upload size guide"}
                                    </span>{" "}
                                    or drag and drop
                                    <input
                                      id="size-guide-upload"
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) => {
                                        const files = Array.from(
                                          e.target.files
                                        );
                                        if (files.length > 0) {
                                          handleSizeGuideImageUpload(files);
                                        }
                                      }}
                                      className="hidden"
                                    />
                                  </div>
                                  <p className="text-base text-gray-500">
                                    PNG, JPG, WEBP up to 5MB
                                  </p>
                                </div>
                              </div>

                              {/* Choose from Library */}
                              <div className="flex flex-col justify-center items-center">
                                <div className="text-base text-gray-500 mb-2">
                                  OR
                                </div>
                                <Dialog
                                  open={showSizeGuideMediaLibrary}
                                  onOpenChange={setShowSizeGuideMediaLibrary}
                                >
                                  <DialogTrigger asChild>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      onClick={() => {
                                        setShowSizeGuideMediaLibrary(true);
                                        fetchMediaLibraryImages();
                                      }}
                                      className="border-gray-300 text-gray-700 hover:bg-gray-50"
                                    >
                                      <ImageIcon className="h-4 w-4 mr-2" />
                                      Choose from Library
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
                                    <DialogHeader>
                                      <DialogTitle>
                                        Choose Size Guide Image
                                      </DialogTitle>
                                      <DialogDescription>
                                        Select an image from your uploaded media
                                        library for the size guide
                                      </DialogDescription>
                                    </DialogHeader>

                                    <div className="space-y-4">
                                      {/* Search */}
                                      <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <Input
                                          placeholder="Search images..."
                                          value={sizeGuideMediaSearchQuery}
                                          onChange={(e) =>
                                            setSizeGuideMediaSearchQuery(
                                              e.target.value
                                            )
                                          }
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
                                        ) : filteredSizeGuideMediaImages.length ===
                                          0 ? (
                                          <div className="text-center py-8">
                                            <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                            <p className="text-gray-500">
                                              {sizeGuideMediaSearchQuery
                                                ? "No images found matching your search."
                                                : "No images in library yet."}
                                            </p>
                                          </div>
                                        ) : (
                                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                            {filteredSizeGuideMediaImages.map(
                                              (image, index) => (
                                                <div
                                                  key={`size-guide-media-${image.publicId}-${index}`}
                                                  className="relative group cursor-pointer border border-gray-200 rounded-lg overflow-hidden hover:border-gray-400 transition-colors"
                                                  onClick={() => {
                                                    const imageData = {
                                                      url: image.url,
                                                      publicId: image.publicId,
                                                      type: "existing",
                                                    };
                                                    setSizeGuideImage(
                                                      imageData
                                                    );
                                                    form.setValue(
                                                      "sizeGuide.image",
                                                      image.url
                                                    );
                                                    setShowSizeGuideMediaLibrary(
                                                      false
                                                    );
                                                  }}
                                                >
                                                  <img
                                                    src={image.url}
                                                    alt={
                                                      image.alt ||
                                                      `Media ${index + 1}`
                                                    }
                                                    className="w-full h-24 object-cover"
                                                  />
                                                  <div className="absolute inset-0 group-hover:bg-opacity-20 transition-opacity flex items-center justify-center">
                                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                      <div className="bg-white rounded-full p-2">
                                                        <ImageIcon className="h-4 w-4 text-gray-600" />
                                                      </div>
                                                    </div>
                                                  </div>
                                                </div>
                                              )
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              </div>
                            </div>

                            {/* Image Preview */}
                            {sizeGuideImage && (
                              <div className="relative group max-w-md">
                                <img
                                  src={sizeGuideImage.url}
                                  alt="Size Guide Preview"
                                  className="w-full h-auto rounded-lg border border-gray-200 shadow-sm"
                                  onError={(e) => {
                                    console.error(
                                      "Size guide image failed to load:",
                                      sizeGuideImage.url
                                    );
                                  }}
                                />
                                <button
                                  type="button"
                                  onClick={handleSizeGuideImageDelete}
                                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                  title="Remove size guide image"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                                <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/50 text-white text-base rounded">
                                  Size Guide
                                </div>
                              </div>
                            )}

                            {sizeGuideUploading && (
                              <div className="text-center py-4">
                                <div className="inline-flex items-center text-base text-gray-600">
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                                  Uploading size guide image...
                                </div>
                              </div>
                            )}
                          </div>
                        </FormControl>
                        <FormDescription>
                          Upload a size guide image to help customers with
                          sizing
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Size Guide Bullet Points */}
                  <FormField
                    control={form.control}
                    name="sizeGuide.bulletPoints"
                    render={({ field }) => {
                      const bulletPoints = field.value || [];

                      const addBulletPoint = () => {
                        const newPoints = [...bulletPoints, ""];
                        field.onChange(newPoints);
                      };

                      const removeBulletPoint = (index) => {
                        const newPoints = bulletPoints.filter(
                          (_, i) => i !== index
                        );
                        field.onChange(newPoints);
                      };

                      const updateBulletPoint = (index, value) => {
                        const newPoints = [...bulletPoints];
                        newPoints[index] = value;
                        field.onChange(newPoints);
                      };

                      return (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-medium">
                            Size Guide Bullet Points
                          </FormLabel>
                          <div className="space-y-3">
                            {bulletPoints.map((point, index) => {
                              const currentLength = point.length;
                              const maxLength = 200;
                              const isOverLimit = currentLength > maxLength;

                              return (
                                <div key={index} className="space-y-2">
                                  <div className="flex gap-2">
                                    <Input
                                      value={point}
                                      onChange={(e) =>
                                        updateBulletPoint(index, e.target.value)
                                      }
                                      placeholder={`Size guide point ${
                                        index + 1
                                      }...`}
                                      className={`flex-1 border-gray-300 focus:border-gray-500 ${
                                        isOverLimit
                                          ? "border-red-300 focus:border-red-500"
                                          : ""
                                      }`}
                                    />
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => removeBulletPoint(index)}
                                      className="text-gray-600 hover:text-gray-700 hover:bg-red-50"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                  <div className="flex justify-end">
                                    <span
                                      className={`text-base ${
                                        isOverLimit
                                          ? "text-gray-500"
                                          : "text-gray-500"
                                      }`}
                                    >
                                      {currentLength}/{maxLength}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={addBulletPoint}
                              className="w-fit border-dashed border-gray-300 !bg-[#efece3] text-gray-700 hover:bg-gray-50 cursor-pointer"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add Size Guide Point
                            </Button>
                          </div>
                          <FormDescription>
                            Add helpful sizing information as bullet points
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />
                </div>

                <Separator />

                {/* FAQ Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-gray-800">
                          FAQ Section
                        </h3>
                        <p className="text-base text-gray-600">
                          Frequently asked questions about this product
                        </p>
                      </div>
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="faqSection"
                    render={({ field }) => {
                      const faqs = field.value || [];

                      const addFAQ = () => {
                        const newFaqs = [...faqs, { question: "", answer: "" }];
                        field.onChange(newFaqs);
                      };

                      const removeFAQ = (index) => {
                        const newFaqs = faqs.filter((_, i) => i !== index);
                        field.onChange(newFaqs);
                      };

                      const updateFAQ = (index, key, value) => {
                        const newFaqs = [...faqs];
                        newFaqs[index][key] = value;
                        field.onChange(newFaqs);
                      };

                      return (
                        <FormItem>
                          <div className="space-y-4">
                            {faqs.map((faq, index) => (
                              <div
                                key={index}
                                className="p-4 border border-gray-200 rounded-lg space-y-3"
                              >
                                <div className="flex items-center justify-between">
                                  <Badge
                                    variant="secondary"
                                    className="text-base"
                                  >
                                    FAQ #{index + 1}
                                  </Badge>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeFAQ(index)}
                                    className="text-gray-600 hover:text-gray-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                                <div className="space-y-3">
                                  <div>
                                    <Label className="text-base font-medium text-gray-700">
                                      Question
                                    </Label>
                                    <Input
                                      value={faq.question}
                                      onChange={(e) =>
                                        updateFAQ(
                                          index,
                                          "question",
                                          e.target.value
                                        )
                                      }
                                      placeholder="Enter the question..."
                                      className={`mt-1 border-gray-300 focus:border-gray-500 ${
                                        faq.question.length > 200
                                          ? "border-red-300 focus:border-red-500"
                                          : ""
                                      }`}
                                    />
                                    <div className="flex justify-end mt-1">
                                      <span
                                        className={`text-base ${
                                          faq.question.length > 200
                                            ? "text-gray-500"
                                            : "text-gray-500"
                                        }`}
                                      >
                                        {faq.question.length}/200
                                      </span>
                                    </div>
                                  </div>
                                  <div>
                                    <Label className="text-base font-medium text-gray-700">
                                      Answer
                                    </Label>
                                    <Textarea
                                      value={faq.answer}
                                      onChange={(e) =>
                                        updateFAQ(
                                          index,
                                          "answer",
                                          e.target.value
                                        )
                                      }
                                      placeholder="Enter the answer..."
                                      rows={3}
                                      className={`mt-1 border-gray-300 focus:border-gray-500 ${
                                        faq.answer.length > 1000
                                          ? "border-red-300 focus:border-red-500"
                                          : ""
                                      }`}
                                    />
                                    <div className="flex justify-end mt-1">
                                      <span
                                        className={`text-base ${
                                          faq.answer.length > 1000
                                            ? "text-gray-500"
                                            : "text-gray-500"
                                        }`}
                                      >
                                        {faq.answer.length}/1000
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={addFAQ}
                              className="w-fit border-dashed border-gray-300 !bg-[#efece3] text-gray-700 hover:bg-gray-50 cursor-pointer"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add FAQ
                            </Button>
                          </div>
                          <FormDescription>
                            Add frequently asked questions and their answers
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />
                </div>

                <Separator />

                {/* Customer Support Notes (Internal) */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-gray-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-gray-800">
                          Customer Support Notes
                        </h3>
                        <p className="text-base text-gray-600">
                          Internal notes for customer support team
                        </p>
                      </div>
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="customerSupportNotes"
                    render={({ field }) => {
                      const notes = field.value || [];

                      const addNote = () => {
                        const newNotes = [...notes, ""];
                        field.onChange(newNotes);
                      };

                      const removeNote = (index) => {
                        const newNotes = notes.filter((_, i) => i !== index);
                        field.onChange(newNotes);
                      };

                      const updateNote = (index, value) => {
                        const newNotes = [...notes];
                        newNotes[index] = value;
                        field.onChange(newNotes);
                      };

                      return (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-medium">
                            Support Notes
                          </FormLabel>
                          <div className="space-y-3">
                            {notes.map((note, index) => {
                              const currentLength = note.length;
                              const maxLength = 300;
                              const isOverLimit = currentLength > maxLength;

                              return (
                                <div key={index} className="space-y-2">
                                  <div className="flex gap-2">
                                    <Input
                                      value={note}
                                      onChange={(e) =>
                                        updateNote(index, e.target.value)
                                      }
                                      placeholder={`Support note ${
                                        index + 1
                                      }...`}
                                      className={`flex-1 border-gray-300 focus:border-gray-500 ${
                                        isOverLimit
                                          ? "border-red-300 focus:border-red-500"
                                          : ""
                                      }`}
                                    />
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => removeNote(index)}
                                      className="text-gray-600 hover:text-gray-700 hover:bg-red-50"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                  <div className="flex justify-end">
                                    <span
                                      className={`text-base ${
                                        isOverLimit
                                          ? "text-gray-500"
                                          : "text-gray-500"
                                      }`}
                                    >
                                      {currentLength}/{maxLength}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={addNote}
                              className="w-fit border-dashed border-gray-300 !bg-[#efece3] text-gray-700 hover:bg-gray-50 cursor-pointer"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add Support Note
                            </Button>
                          </div>
                          <FormDescription>
                            Internal notes to help customer support with this
                            product
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="border-gray-300 text-gray-700 hover:bg-gray-50 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                loading ||
                uploading ||
                categories.length === 0 ||
                images.length === 0
              }
              className="bg-gray-900 hover:bg-gray-800 text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: "#736c5f" }}
            >
              {loading
                ? "Saving..."
                : categories.length === 0
                ? "Add Categories First"
                : images.length === 0
                ? "Upload Images First"
                : isEdit
                ? "Update Product"
                : "Create Product"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

export default ProductForm;
