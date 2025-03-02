import express from "express";
import { Server } from "socket.io";
import http from "http";
import { UserManager } from "./managers/UserManger";

const app = express();
const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["https://omegle-clone-v2.vercel.app", "http://localhost:5173"],
    methods: ["GET", "POST"],
    credentials: true,
    allowedHeaders: ["Content-Type"]
  },
  transports: ['websocket', 'polling'],
  allowEIO3: true
});

// Add CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://omegle-clone-v2.vercel.app');
  res.header('Access-Control-Allow-Methods', 'GET, POST');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
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
