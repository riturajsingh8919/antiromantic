import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    unique: true,
  },
  data: {
    // Admin Profile Information
    adminName: { type: String, default: "" },
    adminEmail: { type: String, default: "" },
    adminPhone: { type: String, default: "" },
    adminJoinDate: { type: String, default: "" },
    adminAddress: { type: String, default: "" },
    adminCity: { type: String, default: "" },
    adminState: { type: String, default: "" },
    adminPincode: { type: String, default: "" },
    adminEmergencyContact: { type: String, default: "" },
    adminBio: { type: String, default: "" },

    // Store Information
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

    // Shipping Settings
    freeShippingEnabled: { type: Boolean, default: true },
    freeShippingThreshold: { type: Number, default: 2000 },
    shippingCost: { type: Number, default: 199 },

    // General Settings
    allowGuestCheckout: { type: Boolean, default: true },
    orderNotifications: { type: Boolean, default: true },

    // Additional fields for flexible data storage
    additionalData: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
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
settingsSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

settingsSchema.pre("findOneAndUpdate", function (next) {
  this.set({ updatedAt: Date.now() });
  next();
});

const Settings =
  mongoose.models.Settings || mongoose.model("Settings", settingsSchema);

export default Settings;
