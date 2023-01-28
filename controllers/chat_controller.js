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

  if (users.length < 2) {
    res.status(400);
    throw new Error("More than 2 users are required to form a group chat");
  }

  users.push(req.user);

  const groupChat = await Chat.create({
    chatName: req.body.name,
    users,
    isGroupChat: true,
    groupAdmin: req.user,
  });

  const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  res.status(200).json(fullGroupChat);
});

exports.renameGroupChat = handleAsync(async (req, res) => {
  const { groupID, groupName } = req.body;

  if (!groupID || !groupName) {
    res.status(400);
    throw new Error("Group ID and Name are both required");
  }

  const chat = await Chat.findById(groupID);

  if (!chat) {
    res.status(404);
    throw new Error("Group not found");
  }

  if (chat.groupAdmin._id.toString() !== req.user._id.toString()) {
    res.status(400);
    throw new Error("Only the group admin can rename this group");
  }

  const updateChat = await Chat.findByIdAndUpdate(
    groupID,
    { chatName: groupName },
    { new: true }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  res.status(200).json(updateChat);
});

exports.addToGroup = handleAsync(async (req, res) => {
  const { chatID, userID } = req.body;

  const chat = await Chat.findById(chatID);

  if (!chat) {
    res.status(404);
    throw new Error("Group not found");
  }

  chat.users.map((user) => {
    console.log(user);
    if (user._id.toString() === userID.toString()) {
      res.status(400);
      throw new Error("User already in the group");
    }
  });

  const updatedChat = await Chat.findByIdAndUpdate(
    chatID,
    { $push: { users: userID } },
    { new: true }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!updatedChat) {
    res.status(500);
    throw new Error("Something went wrong");
  } else {
    res.status(200).json(updatedChat);
  }
});

exports.removeFromGroup = handleAsync(async (req, res) => {
  const { chatID, userID } = req.body;

  const chat = await Chat.findByIdAndUpdate(
    chatID,
    { $pull: { users: userID } },
    { new: true }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!chat) {
    res.status(400);
    throw new Error("Chat not found");
  } else {
    res.status(200).json(chat);
  }
});
