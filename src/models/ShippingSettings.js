import mongoose from "mongoose";

const shippingSettingsSchema = new mongoose.Schema({
  freeShippingEnabled: { type: Boolean, default: true },
  freeShippingThreshold: { type: Number, default: 2000 },
  shippingCost: { type: Number, default: 199 },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field before saving
shippingSettingsSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

shippingSettingsSchema.pre("findOneAndUpdate", function (next) {
  this.set({ updatedAt: Date.now() });
  next();
});

const ShippingSettings =
  mongoose.models.ShippingSettings ||
  mongoose.model("ShippingSettings", shippingSettingsSchema);

export default ShippingSettings;
