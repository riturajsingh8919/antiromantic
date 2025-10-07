import mongoose from "mongoose";

const ProductInnerSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product ID is required"],
    },
    type: {
      type: String,
      required: [true, "Type is required"],
      enum: ["image", "video", "text"],
    },
    // For image type - support multiple images (up to 3)
    images: [
      {
        url: {
          type: String,
          required: true,
        },
        publicId: {
          type: String,
          required: true,
        },
      },
    ],
    // For video type - support multiple videos (up to 2)
    videos: [
      {
        url: {
          type: String,
          required: true,
        },
        publicId: {
          type: String,
          required: true,
        },
        duration: {
          type: Number,
        },
        format: {
          type: String,
        },
      },
    ],
    // For text type
    description: {
      type: String,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    buttonText: {
      type: String,
      maxlength: [50, "Button text cannot exceed 50 characters"],
    },
    link: {
      type: String,
      maxlength: [200, "Link cannot exceed 200 characters"],
    },
    // Common fields
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Add validation to ensure images are required for image types
ProductInnerSchema.pre("save", function (next) {
  if (this.type === "image" && (!this.images || this.images.length === 0)) {
    next(new Error("At least one image is required for image type"));
  } else if (this.type === "text" && !this.description) {
    next(new Error("Description is required for text type"));
  } else {
    next();
  }
});

const ProductInner =
  mongoose.models.ProductInner ||
  mongoose.model("ProductInner", ProductInnerSchema);

export default ProductInner;
