const express = require("express");
const { getAllUsers } = require("../controllers/users_controller");
const { requireAuth } = require("../middlewares/auth_middleware");

const router = express.Router();

router.route("/").get(requireAuth, getAllUsers);

module.exports = router;
