const User = require("../models/user_model");
const handleAsync = require("../utils/asyncHandler");

exports.getAllUsers = handleAsync(async (req, res) => {
  console.log(req.query.user);
  const query = req.query.user
    ? {
        $or: [
          { username: { $regex: req.query.user, $options: "i" } },
          { email: { $regex: req.query.user, $options: "i" } },
        ],
      }
    : {};

  const users = await User.find(query).find({ _id: { $ne: req.user._id } });

  res.status(200).json({
    results: users.length,
    users,
  });
});
