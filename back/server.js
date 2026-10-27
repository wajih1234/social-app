require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const http = require("http");
const jwt = require("jsonwebtoken");
const { Server } = require("socket.io");
const path = require("path");
const PORT = process.env.PORT || 5300;

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API is running");
});
app.use("/api/auth", require("./routes/auth"));
app.use("/api/posts", require("./routes/posts"));
app.use("/api/users", require("./routes/users"));
app.use("/api/messages", require("./routes/messages"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/upload", require("./routes/upload"));
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL },
});
app.set("io", io);

// only logged-in users can connect
io.use((socket, next) => {
  try {
    const decoded = jwt.verify(socket.handshake.auth.token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    next();
  } catch (err) {
    next(new Error("Unauthorized"));
  }
});

// each user joins a private room named after their id
io.on("connection", (socket) => {
  socket.join(socket.userId);
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB error:", err.message));
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});