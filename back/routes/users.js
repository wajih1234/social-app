const express = require("express");
const User = require("../models/User");
const auth = require("../middleware/auth");

const router = express.Router();
const publicFields = "firstName lastName avatar";

// search users by name
router.get("/search", auth, async (req, res) => {
  try {
    const q = (req.query.q || "").trim();
    if (!q) return res.json([]);

    const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    const users = await User.find({
      _id: { $ne: req.userId },
      $or: [{ firstName: regex }, { lastName: regex }],
    })
      .select(publicFields)
      .limit(20);
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// friend requests I received
router.get("/requests", auth, async (req, res) => {
  const me = await User.findById(req.userId).populate("friendRequests", publicFields);
  res.json(me.friendRequests);
});

// my friends (sidebar / chat list)
router.get("/friends", auth, async (req, res) => {
  const me = await User.findById(req.userId).populate("friends", publicFields);
  res.json(me.friends);
});

// update my profile / settings
router.put("/me", auth, async (req, res) => {
  try {
    const allowed = ["firstName", "lastName", "avatar", "coverPhoto"];
    const updates = {};
    allowed.forEach((key) => {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    });

    const user = await User.findByIdAndUpdate(req.userId, updates, { new: true })
      .select("-password -verificationToken -verificationExpires");
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// a user's profile
router.get("/:id", auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password -verificationToken -verificationExpires")
      .populate("friends", publicFields);
    if (!user) return res.status(404).json({ message: "User not found" });

    const data = user.toObject();
    data.requestSent = user.friendRequests.some((id) => id.toString() === req.userId);
    delete data.friendRequests;

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// send a friend request
router.post("/:id/friend-request", auth, async (req, res) => {
  try {
    if (req.params.id === req.userId) {
      return res.status(400).json({ message: "You can't add yourself" });
    }
    const target = await User.findById(req.params.id);
    if (!target) return res.status(404).json({ message: "User not found" });

    if (target.friends.includes(req.userId)) {
      return res.status(400).json({ message: "Already friends" });
    }
    if (target.friendRequests.includes(req.userId)) {
      return res.status(400).json({ message: "Request already sent" });
    }

    target.friendRequests.push(req.userId);
    await target.save();
    res.json({ message: "Request sent" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// accept a request
router.post("/:id/accept", auth, async (req, res) => {
  try {
    const me = await User.findById(req.userId);
    const other = await User.findById(req.params.id);
    if (!other) return res.status(404).json({ message: "User not found" });

    if (!me.friendRequests.includes(other._id)) {
      return res.status(400).json({ message: "No request from this user" });
    }

    me.friendRequests.pull(other._id);
    me.friends.addToSet(other._id);
    other.friends.addToSet(me._id);
    await me.save();
    await other.save();
    res.json({ message: "Friend added" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// decline a request
router.post("/:id/decline", auth, async (req, res) => {
  try {
    const me = await User.findById(req.userId);
    me.friendRequests.pull(req.params.id);
    await me.save();
    res.json({ message: "Request declined" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// remove a friend
router.delete("/:id/friend", auth, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.userId, { $pull: { friends: req.params.id } });
    await User.findByIdAndUpdate(req.params.id, { $pull: { friends: req.userId } });
    res.json({ message: "Friend removed" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;