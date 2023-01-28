const jwt = require("jsonwebtoken");
const User = require("../models/user_model");
const handleAsync = require("../utils/asyncHandler");

exports.requireAuth = handleAsync(async (req, res, next) => {
  let token;
  const headers = req.headers.authorization;

  if (headers && headers.startsWith("Bearer")) {
    token = headers.split(" ")[1];
  } else if (req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    res.status(401);
    throw new Error("You are not logged in. Please log in to get access");
  }

  const payload = jwt.verify(token, process.env.JWT_SECRET);

  const currentUser = await User.findById(payload.id).select("-password");

  if (!currentUser) {
    res.status(401);
    throw new Error("The user with this token no longer exists");
  }

  req.user = currentUser;

  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      res.status(401);
      throw new Error("Unauthorized. Only admins can perform this action");
    }

    next();
  };
};
