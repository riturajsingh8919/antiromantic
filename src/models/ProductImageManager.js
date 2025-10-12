import mongoose from "mongoose";

const ProductImageManagerSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product ID is required"],
      unique: true, // Each product can have only one image manager entry
    },
    normalImage: {
      url: {
        type: String,
        required: true,
      },
      publicId: {
        type: String,
        required: true,
      },
      alt: {
        type: String,
        default: "",
      },
      width: {
        type: Number,
        required: true,
      },
      height: {
        type: Number,
        required: true,
      },
      format: {
        type: String,
        required: true,
      },
      size: {
        type: Number,
        required: true,
      },
    },
    hoverImage: {
      url: {
        type: String,
        required: true,
      },
      publicId: {
        type: String,
        required: true,
      },
      alt: {
        type: String,
        default: "",
      },
      width: {
        type: Number,
        required: true,
      },
      height: {
        type: Number,
        required: true,
      },
      format: {
        type: String,
        required: true,
      },
      size: {
        type: Number,
        required: true,
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Add validation to ensure both images are provided
ProductImageManagerSchema.pre("save", function (next) {
  if (!this.normalImage || !this.hoverImage) {
    next(new Error("Both normal and hover images are required"));
  } else {
    next();
  }
});

const ProductImageManager =
  mongoose.models.ProductImageManager ||
  mongoose.model("ProductImageManager", ProductImageManagerSchema);

export default ProductImageManager;
