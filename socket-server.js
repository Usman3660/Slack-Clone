const { Server } = require("socket.io")
const http = require("http")

const PORT = process.env.SOCKET_PORT || 3001 // Use a different port than Next.js

const httpServer = http.createServer()
const io = new Server(httpServer, {
  cors: {
    origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000", // Allow connections from your Next.js app
    methods: ["GET", "POST"],
  },
})

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id)

  socket.on("joinChannel", (channelId) => {
    socket.join(channelId)
    console.log(`Socket ${socket.id} joined channel ${channelId}`)
  })

  socket.on("leaveChannel", (channelId) => {
    socket.leave(channelId)
    console.log(`Socket ${socket.id} left channel ${channelId}`)
  })

  socket.on("sendMessage", (message) => {
    console.log("Received message:", message)
    // Emit the message to all clients in the specific channel
    io.to(message.channelId).emit("receiveMessage", message)
  })

  socket.on("typing", ({ channelId, userId, username }) => {
    // Broadcast to all others in the channel
    socket.to(channelId).emit("userTyping", { userId, username, channelId })
  })

  socket.on("stopTyping", ({ channelId, userId }) => {
    // Broadcast to all others in the channel
    socket.to(channelId).emit("userStopTyping", { userId, channelId })
  })

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id)
  })
})

httpServer.listen(PORT, () => {
  console.log(`Socket.IO server listening on port ${PORT}`)
})
