const mongoose = require("mongoose");
const { genSalt, hash, compare } = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
    },
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
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
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await genSalt(10);
  this.password = await hash(this.password, salt);

  next();
});

userSchema.methods.correctPassword = async function (
  providedPassword,
  userPassword
) {
  return await compare(providedPassword, userPassword);
};

const User = mongoose.model("User", userSchema);

module.exports = User;
