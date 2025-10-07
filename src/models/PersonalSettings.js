import mongoose from "mongoose";

const personalSettingsSchema = new mongoose.Schema({
  adminName: { type: String, required: true },
  adminEmail: { type: String, required: true },
  adminPhone: { type: String, required: true },
  adminJoinDate: { type: String, default: "" },
  adminAddress: { type: String, default: "" },
  adminCity: { type: String, default: "" },
  adminState: { type: String, default: "" },
  adminPincode: { type: String, default: "" },
  adminEmergencyContact: { type: String, default: "" },
  adminBio: { type: String, default: "" },
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
personalSettingsSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

personalSettingsSchema.pre("findOneAndUpdate", function (next) {
  this.set({ updatedAt: Date.now() });
  next();
});

const PersonalSettings =
  mongoose.models.PersonalSettings ||
  mongoose.model("PersonalSettings", personalSettingsSchema);

export default PersonalSettings;
