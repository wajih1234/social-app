const express = require("express");
const multer = require("multer");
const path = require("path");
const crypto = require("crypto");
const auth = require("../middleware/auth");
const fs = require("fs");

const uploadDir = path.join(__dirname, "..", "uploads");
fs.mkdirSync(uploadDir, { recursive: true });
const router = express.Router();

const extensions = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/gif": ".gif",
  "image/webp": ".webp",
};

const upload = multer({
  storage: multer.diskStorage({
   destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) =>
      cb(null, crypto.randomBytes(16).toString("hex") + extensions[file.mimetype]),
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (extensions[file.mimetype]) cb(null, true);
    else cb(new Error("Only JPG, PNG, GIF or WEBP images are allowed"));
  },
});

router.post("/", auth, (req, res) => {
  upload.single("image")(req, res, (err) => {
    if (err) return res.status(400).json({ message: err.message });
    if (!req.file) return res.status(400).json({ message: "No file" });

    res.json({
      url: `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`,
    });
  });
});

module.exports = router;