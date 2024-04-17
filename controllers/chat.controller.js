const asyncHandler = require("express-async-handler");
const Chat = require("../models/Chat");
const Message = require("../models/Message");
const { upload } = require("../utils/upload");

exports.sendMessage = asyncHandler(async (req, res) => {
  upload(req, res, async (err) => {
    const { reciver, message, gif } = req.body;
    const userId = req.user;
    const audio = req.files?.audio ? req.files.audio[0].filename : null;
    const video = req.files?.video ? req.files.video[0].filename : null;
    const image = req.files?.image ? req.files.image[0].filename : null;

    let result;
    const x = await Chat.findById(reciver);
    if (x) {
      await Message.create({
        sender: userId,
        message,
        gif,
        chat: x._id,
        audio,
        video,
        image,
      });
    } else {
      result = await Chat.findOne({
        $and: [{ users: userId }, { users: reciver }],
      });

      if (result) {
        await Message.create({
          sender: userId,
          message,
          gif,
          chat: result._id,
          audio,
          video,
          image,
        });
      } else {
        // 1st msg
        const x = await Chat.create({ users: [userId, reciver] });
        await Message.create({
          sender: userId,
          message,
          gif,
          chat: x._id,
          audio,
          video,
          image,
        });
      }
    }
    res.status(201).json({ message: "Message Send Success" });
  });
});

exports.getMessages = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { page } = req.query;

  const groupResult = await Chat.findById(id);
  const chatResult = await Chat.findOne({
    $and: [{ users: id }, { users: req.body.userId }],
  });
  const total = await Message.countDocuments({
    chat: groupResult ? id : chatResult._id,
  });
  const result = await Message.find({
    chat: groupResult ? id : chatResult._id,
  })
    .sort({ createdAt: -1 })
    .limit(10)
    .skip(10 * page)
    .populate("sender");
  res.status(200).json({ message: "Message Fetch Success", result, total });
});

exports.contacts = asyncHandler(async (req, res) => {
  //   console.log(`${req.body.userId}`.bgRed);
  const { userId } = req.body;
  const result = await Chat.find({ users: userId, isGroup: false })
    .populate("users", "_id name mobile email photo")
    .lean();
  const groupResult = await Chat.find({ users: userId, isGroup: true })
    .populate("users", "_id name mobile email photo")
    .lean();
  const filtered = result
    .map((item) => item.users)
    .flat()
    .filter((item) => item._id != userId);
  //   console.log(filtered);
  res.status(200).json({
    message: "Contact Fetch Success",
    result: [...filtered, ...groupResult],
  });
});

exports.createGroup = asyncHandler(async (req, res) => {
  const { userId, users, name } = req.body;
  const result = await Chat.create({
    admin: userId,
    users: [...users, userId],
    isGroup: true,
    name,
  });
  res.status(200).json({ message: "Contact Fetch Success", result });
});
