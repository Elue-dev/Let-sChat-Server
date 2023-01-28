const { validateEmail, createAndSendToken } = require("../helpers/auth_helper");
const User = require("../models/user_model");
const handleAsync = require("../utils/asyncHandler");

exports.signup = handleAsync(async (req, res) => {
  const { username, email, password, photo } = req.body;

  if (!username || !email || !password) {
    res.status(400);
    throw new Error("Please Enter all the Fields");
  }

  if (!validateEmail(email)) {
    res.status(400);
    throw new Error("Please enter a valid email address");
  }

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error("Email already exists");
  }

  const user = await User.create({
    username,
    email,
    password,
    photo,
  });

  if (user) {
    createAndSendToken(user, 201, res);
  } else {
    res.status(500);
    throw new Error("Failed to create user");
  }
});

exports.login = handleAsync(async (req, res) => {
  const { emailOrUsername, password } = req.body;

  if (!emailOrUsername || !password) {
    res.status(400);
    throw new Error(
      "Please Enter all the Fields (Username or Email and Password)"
    );
  }

  const user = await User.findOne({
    $or: [
      { email: emailOrUsername.trim() },
      { username: emailOrUsername.trim() },
    ],
  }).select("+password");

  if (!user || !(await user.correctPassword(password, user.password))) {
    res.status(400);
    throw new Error("invalid credentials");
  }

  createAndSendToken(user, 200, res);
});
