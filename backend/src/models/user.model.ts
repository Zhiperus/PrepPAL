import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true },
  password: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  location: {
    region: { type: String, required: true },
    province: { type: String, required: true },
    city: { type: String, required: true },
    barangay: { type: String, required: true },
  },
  householdInfo: {
    name: { type: String, required: true },
    memberCount: { type: Number, required: true },
    femaleCount: { type: Number, required: true },
    dogCount: { type: Number, required: true },
    catCount: { type: Number, required: true },
  },
  notification: {
    email: { type: Boolean, required: true, default: true },
    sms: { type: Boolean, required: true, default: true },
  },
  role: { type: String, required: true },

  modulePoints: { type: Number, required: true, default: 0 },
  goBagPoints: { type: Number, required: true, default: 0 },
  totalPoints: { type: Number, required: true, default: 0 },
  completedCoursesCount: { type: Number, required: true, default: 0 },
  createdAt: { type: Date, required: true, default: Date.now },
  updatedAt: { type: Date, required: true, default: Date.now },
  personalGoBagId: { type: mongoose.Schema.Types.ObjectId, ref: "GoBag" },
  recommendedGoBagId: { type: mongoose.Schema.Types.ObjectId, ref: "GoBag" },
  lastViewedModuleId: { type: mongoose.Schema.Types.ObjectId, ref: "Module" },
});

const User = mongoose.model("Quiz", userSchema);

export default User;
