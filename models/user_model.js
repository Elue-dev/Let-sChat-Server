const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
    },
    username: {
      type: String,
      required: [true, "Username is required"],
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Passsword is required"],
      select: false,
      trim: true,
    },
    photo: {
      type: String,
      required: [true, "Please add a photo"],
      default: "https://a0.muscache.com/defaults/user_pic-50x50.png?v=3",
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
