import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: "user",
      enum: ["user", "moderator", "admin"],
    },
    skills: [String],
  },
  { timestamps: true }
);

userSchema.pre("save", async (next) => {
  if (!this.isModified(password)) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.isPasswordValid = async function (pass) {
  return await bcrypt.compare(pass, this.password);
};

export const User = mongoose.model("User", userSchema);
