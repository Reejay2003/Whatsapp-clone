import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
  },
  // FIX: define 'name' only once
  name: {
    type: String,
    required: true,
  },
  profilePic: {
    type: String,
    default: "",
  },

  // E2EE
  e2ePublicKey: { type: Object, default: null },  // JWK (public)
  e2eKeyBackup: { type: Object, default: null },  // {v,kdf,iters,salt,iv,ct}

}, { timestamps: true });

export default mongoose.model("User", userSchema);