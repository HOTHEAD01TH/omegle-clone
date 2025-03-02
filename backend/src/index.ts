import express from "express";
import { Server } from "socket.io";
import http from "http";
import { UserManager } from "./managers/UserManger";

const app = express();
const PORT = process.env.PORT || 3000; // Use Render’s port or default to 3000
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "https://omegle-clone-v2.vercel.app", 
    methods: ["GET", "POST"],
  },
});

const userManager = new UserManager();

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);
  userManager.addUser("randomName", socket);

  socket.on("disconnect", () => {
    console.log("User disconnected");
    userManager.removeUser(socket.id);
  });
});

// ✅ Fix: Listen on `process.env.PORT`
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
