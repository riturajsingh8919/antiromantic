import mongoose from "mongoose";

const SizeStockSchema = new mongoose.Schema({
  size: {
    type: String,
    required: true,
    enum: ["XS", "S", "M", "L", "XL", "XXL"],
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
  },
});

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxlength: [200, "Product name cannot exceed 200 characters"],
    },
    slug: {
      type: String,
      required: [true, "Product slug is required"],
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    shortDescription: {
      type: String,
      maxlength: [500, "Short description cannot exceed 500 characters"],
    },

    // Category - references Category collection
    category: {
      type: String,
      required: [true, "Product category is required"],
      trim: true,
      // Note: Category validation should be done at application level
      // to ensure the category exists in the Category collection
    },

    // Images
    images: [
      {
        url: {
          type: String,
          required: false,
        },
        publicId: {
          type: String,
          required: false,
        },
        alt: {
          type: String,
          default: "",
        },
      },
    ],

    // Single color for the product
    colorName: {
      type: String,
      required: [true, "Color name is required"],
      trim: true,
    },

    // Pricing
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: 0,
    },
    comparePrice: {
      type: Number,
      min: 0,
    },

    // Size-wise stock
    sizeStock: [SizeStockSchema],

    // Material and care
    material: {
      type: String,
      required: true,
    },
    careInstructions: {
      type: String,
    },

    // Inventory - calculated from sizeStock
    totalStock: {
      type: Number,
      default: 0,
    },
    lowStockThreshold: {
      type: Number,
      default: 5,
      min: 0,
    },

    // Product status
    status: {
      type: String,
      enum: ["draft", "active", "inactive", "out_of_stock"],
      default: "draft",
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },

    // Physical properties
    weight: {
      type: Number,
      min: 0,
      default: 0,
    },

    // Shipping
    shippingClass: {
      type: String,
      enum: ["standard", "express", "fragile", "special"],
      default: "standard",
    },
    requiresSpecialHandling: {
      type: Boolean,
      default: false,
    },
    estimatedDeliveryDays: {
      type: Number,
      min: 1,
      default: 7,
    },

    // Customer Assistance - Enhanced Structure
    sizeGuide: {
      bulletPoints: [
        {
          type: String,
          maxlength: [
            200,
            "Size guide bullet point cannot exceed 200 characters",
          ],
        },
      ],
      image: {
        type: String, // URL for size guide image
        maxlength: [500, "Image URL cannot exceed 500 characters"],
      },
    },
    faqSection: [
      {
        question: {
          type: String,
          required: true,
          maxlength: [200, "FAQ question cannot exceed 200 characters"],
        },
        answer: {
          type: String,
          required: true,
          maxlength: [1000, "FAQ answer cannot exceed 1000 characters"],
        },
      },
    ],
    customerSupportNotes: [
      {
        type: String,
        maxlength: [300, "Customer support note cannot exceed 300 characters"],
      },
    ],

    // Reviews
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },

    // SEO
    metaTitle: {
      type: String,
      maxlength: [60, "Meta title cannot exceed 60 characters"],
    },
    metaDescription: {
      type: String,
      maxlength: [160, "Meta description cannot exceed 160 characters"],
    },

    // Timestamps
    createdBy: {
      type: String,
      default: "admin",
    },
    updatedBy: {
      type: String,
      default: "admin",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
// Note: slug index is automatically created due to unique: true in schema
ProductSchema.index({ category: 1 });
ProductSchema.index({ status: 1 });
ProductSchema.index({ isFeatured: 1 });
ProductSchema.index({ createdAt: -1 });
ProductSchema.index({ name: "text", description: "text" });

// Virtual to calculate total stock from size-wise stock
ProductSchema.virtual("calculatedTotalStock").get(function () {
  if (!this.sizeStock || !Array.isArray(this.sizeStock)) {
    return 0;
  }
  return this.sizeStock.reduce(
    (total, sizeItem) => total + (sizeItem.stock || 0),
    0
  );
});

// Pre-save middleware to calculate total stock
ProductSchema.pre("save", function (next) {
  if (this.sizeStock && Array.isArray(this.sizeStock)) {
    this.totalStock = this.sizeStock.reduce(
      (total, sizeItem) => total + (sizeItem.stock || 0),
      0
    );
  } else {
    this.totalStock = 0;
  }

  // Update status based on stock
  if (this.totalStock === 0 && this.status === "active") {
    this.status = "out_of_stock";
  } else if (this.totalStock > 0 && this.status === "out_of_stock") {
    this.status = "active";
  }

  next();
});

// Method to check if product is low stock
ProductSchema.methods.isLowStock = function () {
  return this.totalStock <= this.lowStockThreshold;
};

// Method to get available sizes
ProductSchema.methods.getAvailableSizes = function () {
  return this.sizeStock
    .filter((sizeItem) => sizeItem.stock > 0)
    .map((sizeItem) => sizeItem.size);
};

// Method to get size stock by size
ProductSchema.methods.getStockBySize = function (size) {
  const sizeItem = this.sizeStock.find((item) => item.size === size);
  return sizeItem ? sizeItem.stock : 0;
};

// Static method to find products with low stock
ProductSchema.statics.findLowStock = function () {
  return this.find({
    $expr: { $lte: ["$totalStock", "$lowStockThreshold"] },
    status: { $in: ["active", "out_of_stock"] },
  });
};

const Product =
  mongoose.models.Product || mongoose.model("Product", ProductSchema);

export default Product;
