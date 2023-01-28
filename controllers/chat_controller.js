const Chat = require("../models/chat_model");
const User = require("../models/user_model");
const handleAsync = require("../utils/asyncHandler");

exports.accessChat = handleAsync(async (req, res) => {
  const { userID } = req.body;

  if (!userID) {
    res.status(400);
    throw new Error("userID must be sent with this request");
  }

  let isChat = await Chat.find({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: req.user._id } } },
      { users: { $elemMatch: { $eq: userID } } },
    ],
  })
    .populate("users", "-password")
    .populate("latestMessage");

  isChat = await User.populate(isChat, {
    path: "latestMessage.sender",
    select: "username, photo, email",
  });

  if (isChat.length > 0) {
    res.status(200).json(isChat[0]);
  } else {
    //if no chat, create chat
    const chatData = {
      chatName: "sender",
      isGroupChat: false,
      users: [req.user._id, userID],
    };

    try {
      const createdChat = await Chat.create(chatData);
      const fullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        "users",
        "-password"
      );
      res.status(200).json(fullChat);
    } catch (error) {
      res.status(500).json(error);
    }
  }
});

exports.getChats = handleAsync(async (req, res) => {
  let chats = await Chat.find({
    users: { $elemMatch: { $eq: req.user._id } },
  })
    .populate("users", "-password")
    .populate("latestMessage")
    .populate("groupAdmin", "-password")
    .sort("-createdAt");

  chats = await User.populate(chats, {
    path: "latestMessage.sender",
    select: "username, photo, email",
  });

  res.status(200).json(chats);
});

exports.createGroupChat = handleAsync(async (req, res) => {
  if (!req.body.users || !req.body.name) {
    res.status(400);
    throw new Error("Please fill all the fields");
  }

  const users = JSON.parse(req.body.users);
});
