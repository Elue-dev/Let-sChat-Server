const express = require("express");
const {
  accessChat,
  getChats,
  createGroupChat,
  renameGroupChat,
  addToGroup,
  removeFromGroup,
} = require("../controllers/chat_controller");
const { requireAuth } = require("../middlewares/auth_middleware");

const router = express.Router();

router.route("/").post(requireAuth, accessChat).get(requireAuth, getChats);
router.route("/group").post(requireAuth, createGroupChat);
router.route("/renameGroup").put(requireAuth, renameGroupChat);
router.route("/removeFromGroup").put(requireAuth, removeFromGroup);
router.route("/addToGroup").put(requireAuth, addToGroup);

module.exports = router;
