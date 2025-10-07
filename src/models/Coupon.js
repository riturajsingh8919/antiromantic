import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    couponCode: {
      type: String,
      required: [true, "Coupon code is required"],
      unique: true,
      uppercase: true,
      trim: true,
      minlength: [3, "Coupon code must be at least 3 characters"],
      maxlength: [20, "Coupon code must not exceed 20 characters"],
      match: [
        /^[A-Z0-9]+$/,
        "Coupon code can only contain letters and numbers",
      ],
    },
    discountType: {
      type: String,
      required: [true, "Discount type is required"],
      enum: {
        values: ["amount", "percentage"],
        message: "Discount type must be either 'amount' or 'percentage'",
      },
    },
    discountValue: {
      type: Number,
      required: [true, "Discount value is required"],
      min: [0, "Discount value must be positive"],
      validate: {
        validator: function (value) {
          if (this.discountType === "percentage") {
            return value <= 100;
          }
          return true;
        },
        message: "Percentage discount cannot exceed 100%",
      },
    },
    status: {
      type: Boolean,
      default: true,
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },
    endDate: {
      type: Date,
      required: [true, "End date is required"],
      validate: {
        validator: function (value) {
          // For updates, we need to check if startDate exists and is valid
          if (this.startDate) {
            return new Date(value) > new Date(this.startDate);
          }
          return true; // Let other validation handle missing startDate
        },
        message: "End date must be after start date",
      },
    },
    usageLimit: {
      type: Number,
      min: [1, "Usage limit must be at least 1"],
      default: null,
    },
    perUserLimit: {
      type: Number,
      min: [1, "Per user limit must be at least 1"],
      default: null,
    },
    usedCount: {
      type: Number,
      default: 0,
      min: [0, "Used count cannot be negative"],
    },
    description: {
      type: String,
      maxlength: [200, "Description must not exceed 200 characters"],
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries (couponCode index is created by unique: true)
couponSchema.index({ status: 1 });
couponSchema.index({ startDate: 1, endDate: 1 });

// Virtual for checking if coupon is expired
couponSchema.virtual("isExpired").get(function () {
  return new Date() > this.endDate;
});

// Virtual for checking if coupon is active and valid
couponSchema.virtual("isValid").get(function () {
  const now = new Date();
  return (
    this.status &&
    now >= this.startDate &&
    now <= this.endDate &&
    (this.usageLimit === null || this.usedCount < this.usageLimit)
  );
});

// Method to check if user has exceeded per-user limit
couponSchema.methods.canUserUseCoupon = async function (userId) {
  if (!this.perUserLimit) return true;

  // This would require tracking coupon usage per user
  // We'll implement this in the Order model or a separate CouponUsage model
  return true; // Placeholder for now
};

// Static method to find valid coupon by code
couponSchema.statics.findValidCoupon = function (code) {
  const now = new Date();
  return this.findOne({
    couponCode: code.toUpperCase(),
    status: true,
    startDate: { $lte: now },
    endDate: { $gte: now },
    $or: [
      { usageLimit: null },
      { $expr: { $lt: ["$usedCount", "$usageLimit"] } },
    ],
  });
};

// Pre-save middleware to normalize coupon code
couponSchema.pre("save", function (next) {
  if (this.couponCode) {
    this.couponCode = this.couponCode.toUpperCase();
  }
  next();
});

const Coupon = mongoose.models.Coupon || mongoose.model("Coupon", couponSchema);

export default Coupon;
