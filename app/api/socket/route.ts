import type { Server as NetServer } from "http"
import { Server as SocketIOServer } from "socket.io"
import { type NextRequest, NextResponse } from "next/server"

// This is a hack to make Socket.IO work with Next.js App Router API routes.
// In a real-world scenario, you might use a custom server or a dedicated WebSocket service.
// This approach leverages the Next.js development server's underlying HTTP server.

// Declare a global variable to hold the Socket.IO server instance
// Renamed 'io' to 'socketIoServer' to avoid conflict with client-side @types/socket.io-client
declare global {
  var socketIoServer: SocketIOServer | undefined
}

export async function GET(req: NextRequest) {
  // @ts-ignore
  const res = NextResponse.json({ message: "Socket.IO server is running" })

  // @ts-ignore
  if (!res.socket.server.socketIoServer) {
    // Use the new global variable name
    console.log("New Socket.io server...")
    // @ts-ignore
    const httpServer: NetServer = res.socket.server
    const io = new SocketIOServer(httpServer, {
      path: "/api/socket", // This path must match the client-side connection path
      addTrailingSlash: false,
    })

    io.on("connection", (socket) => {
      console.log("Socket connected:", socket.id)

      socket.on("joinChannel", (channelId: string) => {
        socket.join(channelId)
        console.log(`Socket ${socket.id} joined channel ${channelId}`)
      })

      socket.on("leaveChannel", (channelId: string) => {
        socket.leave(channelId)
        console.log(`Socket ${socket.id} left channel ${channelId}`)
      })

      socket.on("sendMessage", (message) => {
        console.log("Received message:", message)
        // Emit the message to all clients in the specific channel
        io.to(message.channelId).emit("receiveMessage", message)
      })

      socket.on("disconnect", () => {
        console.log("Socket disconnected:", socket.id)
      })
    })

    // @ts-ignore
    res.socket.server.socketIoServer = io // Assign to the new global variable name
  } else {
    console.log("Socket.io server already running")
  }

  return res
}
