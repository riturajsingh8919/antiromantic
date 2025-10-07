import mongoose from "mongoose";

const storeSettingsSchema = new mongoose.Schema({
  storeName: { type: String, required: true },
  storeEmail: { type: String, required: true },
  storePhone: { type: String, required: true },
  storeAddress: { type: String, required: true },
  storeCity: { type: String, default: "" },
  storeState: { type: String, default: "" },
  storePincode: { type: String, default: "" },
  defaultCountry: { type: String, default: "India" },
  storeDescription: { type: String, default: "" },
  gstNumber: { type: String, default: "" },
  panNumber: { type: String, default: "" },
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
storeSettingsSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

storeSettingsSchema.pre("findOneAndUpdate", function (next) {
  this.set({ updatedAt: Date.now() });
  next();
});

const StoreSettings =
  mongoose.models.StoreSettings ||
  mongoose.model("StoreSettings", storeSettingsSchema);

export default StoreSettings;
