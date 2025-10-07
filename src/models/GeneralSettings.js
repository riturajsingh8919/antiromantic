import mongoose from "mongoose";

const generalSettingsSchema = new mongoose.Schema({
  allowGuestCheckout: { type: Boolean, default: true },
  orderNotifications: { type: Boolean, default: true },
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
generalSettingsSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

generalSettingsSchema.pre("findOneAndUpdate", function (next) {
  this.set({ updatedAt: Date.now() });
  next();
});

const GeneralSettings =
  mongoose.models.GeneralSettings ||
  mongoose.model("GeneralSettings", generalSettingsSchema);

export default GeneralSettings;
