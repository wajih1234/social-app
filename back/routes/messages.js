const express = require("express");
const Message = require("../models/Message");
const User = require("../models/User");
const auth = require("../middleware/auth");

const router = express.Router();

// conversation history with one friend (and mark their messages as read)
router.get("/:userId", auth, async (req, res) => {
  try {
    const { userId } = req.params;

    const messages = await Message.find({
      $or: [
        { sender: req.userId, receiver: userId },
        { sender: userId, receiver: req.userId },
      ],
    }).sort({ createdAt: 1 });

    await Message.updateMany(
      { sender: userId, receiver: req.userId, read: false },
      { read: true }
    );

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// send a message to a friend
router.post("/:userId", auth, async (req, res) => {
  try {
    const text = (req.body.text || "").trim();
    if (!text) return res.status(400).json({ message: "Message is empty" });

    const me = await User.findById(req.userId);
    if (!me.friends.includes(req.params.userId)) {
      return res.status(403).json({ message: "You can only chat with friends" });
    }

    const message = await Message.create({
      sender: req.userId,
      receiver: req.params.userId,
      text,
    });

    // push it in real time to the receiver
    req.app.get("io").to(req.params.userId).emit("newMessage", message);

    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;