import { NextResponse } from "next/server"

// This file no longer hosts the Socket.IO server.
// The Socket.IO server is now run as a separate Node.js process (socket-server.js).

export async function GET() {
  return NextResponse.json({ message: "Socket.IO server is handled by a separate process." })
}
