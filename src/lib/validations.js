import { z } from "zod";

// Category validation schema
export const categorySchema = z.object({
  name: z
    .string()
    .min(1, "Category name is required")
    .max(100, "Category name is too long"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug must contain only lowercase letters, numbers, and hyphens"
    ),
  description: z.string().optional(),
  parentCategory: z.string().optional(),
  isActive: z.boolean().default(true),
});

// Product variant schema
export const productVariantSchema = z.object({
  size: z.enum(["XS", "S", "M", "L", "XL", "XXL", "XXXL"]),
  color: z.string().min(1, "Color is required"),
  stock: z.number().min(0, "Stock cannot be negative"),
  price: z.number().min(0, "Price cannot be negative"),
  discountPrice: z
    .number()
    .min(0, "Discount price cannot be negative")
    .optional(),
  sku: z.string().min(1, "SKU is required"),
});

// Product validation schema
export const productSchema = z.object({
  name: z
    .string()
    .min(1, "Product name is required")
    .max(200, "Product name is too long"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug must contain only lowercase letters, numbers, and hyphens"
    ),
  description: z
    .string()
    .min(1, "Description is required")
    .max(2000, "Description is too long"),
  shortDescription: z
    .string()
    .max(500, "Short description is too long")
    .optional(),
  category: z.string().min(1, "Category is required"),
  subcategory: z.enum(["tops", "bottoms", "dresses", "sets"]).optional(),
  basePrice: z.number().min(0, "Base price cannot be negative"),
  comparePrice: z
    .number()
    .min(0, "Compare price cannot be negative")
    .optional(),
  material: z.string().min(1, "Material is required"),
  careInstructions: z.string().optional(),
  totalStock: z.number().min(0, "Stock cannot be negative"),
  lowStockThreshold: z
    .number()
    .min(0, "Low stock threshold cannot be negative")
    .default(5),
  metaTitle: z.string().max(60, "Meta title is too long").optional(),
  metaDescription: z
    .string()
    .max(160, "Meta description is too long")
    .optional(),
  keywords: z.array(z.string()).optional(),
  status: z
    .enum(["draft", "active", "inactive", "out_of_stock"])
    .default("draft"),
  isFeatured: z.boolean().default(false),
  tags: z.array(z.string()).optional(),
  weight: z.number().min(0, "Weight cannot be negative").optional(),
  variants: z.array(productVariantSchema).optional(),
});

// User validation schema
export const userSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().optional(),
  role: z.enum(["customer", "admin"]).default("customer"),
  isActive: z.boolean().default(true),
  newsletter: z.boolean().default(false),
  gender: z.enum(["male", "female", "other", "prefer_not_to_say"]).optional(),
});

// Address validation schema
export const addressSchema = z.object({
  type: z.enum(["billing", "shipping"]),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  company: z.string().optional(),
  address1: z.string().min(1, "Address is required"),
  address2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zipCode: z.string().min(1, "Zip code is required"),
  country: z.string().min(1, "Country is required").default("US"),
  isDefault: z.boolean().default(false),
});

// Order validation schema
export const orderSchema = z.object({
  customer: z.string().min(1, "Customer is required"),
  items: z
    .array(
      z.object({
        product: z.string().min(1, "Product is required"),
        quantity: z.number().min(1, "Quantity must be at least 1"),
        variant: z
          .object({
            size: z.string().optional(),
            color: z.string().optional(),
            sku: z.string().optional(),
          })
          .optional(),
      })
    )
    .min(1, "At least one item is required"),
  shippingAddress: addressSchema,
  billingAddress: addressSchema,
  paymentMethod: z.enum([
    "credit_card",
    "debit_card",
    "paypal",
    "stripe",
    "cod",
  ]),
  shippingMethod: z
    .enum(["standard", "express", "overnight", "pickup"])
    .default("standard"),
  notes: z.string().optional(),
  customerNotes: z.string().optional(),
});

// Login validation schema
export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

// Image upload validation
export const imageUploadSchema = z.object({
  file: z.any(),
  folder: z.string().optional().default("antiromantic"),
});

const validationSchemas = {
  categorySchema,
  productSchema,
  productVariantSchema,
  userSchema,
  addressSchema,
  orderSchema,
  loginSchema,
  imageUploadSchema,
};

export default validationSchemas;
