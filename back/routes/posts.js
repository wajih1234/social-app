const express = require("express");
const Post = require("../models/Post");
const User = require("../models/User");
const auth = require("../middleware/auth");

const router = express.Router();
const authorFields = "firstName lastName avatar";

// create a post
router.post("/", auth, async (req, res) => {
  try {
    const { text, image } = req.body;
    if (!text && !image) {
      return res.status(400).json({ message: "Post is empty" });
    }
    const post = await Post.create({ author: req.userId, text, image });
    await post.populate("author", authorFields);
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// feed: my posts + my friends' posts
router.get("/feed", auth, async (req, res) => {
  try {
    const me = await User.findById(req.userId);
    const posts = await Post.find({ author: { $in: [req.userId, ...me.friends] } })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate("author", authorFields)
      .populate("comments.user", authorFields);
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// posts of one user (for the profile page)
router.get("/user/:id", auth, async (req, res) => {
  try {
    const posts = await Post.find({ author: req.params.id })
      .sort({ createdAt: -1 })
      .populate("author", authorFields)
      .populate("comments.user", authorFields);
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// like / unlike
router.put("/:id/like", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const index = post.likes.findIndex((id) => id.toString() === req.userId);
    if (index === -1) post.likes.push(req.userId);
    else post.likes.splice(index, 1);

    await post.save();
    res.json({ likes: post.likes });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// comment
router.post("/:id/comment", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    post.comments.push({ user: req.userId, text: req.body.text });
    await post.save();
    await post.populate("comments.user", authorFields);
    res.status(201).json(post.comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// delete (only the author)
router.delete("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    if (post.author.toString() !== req.userId) {
      return res.status(403).json({ message: "Not allowed" });
    }
    await post.deleteOne();
    res.json({ message: "Post deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;