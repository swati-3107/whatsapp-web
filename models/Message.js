const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Types.ObjectId,
      ref: "user",
    },
    chat: {
      type: mongoose.Types.ObjectId,
      ref: "chat",
    },
    message: String,
    gif: String,
    audio: String,
    video: String,
    image: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("message", messageSchema);
