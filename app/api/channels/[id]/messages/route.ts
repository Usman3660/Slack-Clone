import { type NextRequest, NextResponse } from "next/server"

// Mock messages database
const mockMessages = [
  {
    id: "1",
    content: "Welcome to the general channel! 👋",
    userId: "1",
    username: "john_doe",
    channelId: "1",
    timestamp: new Date("2024-01-01T10:00:00Z"),
  },
  {
    id: "2",
    content: "Thanks! Excited to be here and start collaborating.",
    userId: "2",
    username: "jane_smith",
    channelId: "1",
    timestamp: new Date("2024-01-01T10:05:00Z"),
  },
  {
    id: "3",
    content: "Let's build something amazing together! 🚀",
    userId: "1",
    username: "john_doe",
    channelId: "1",
    timestamp: new Date("2024-01-01T10:10:00Z"),
  },
]

function getUserIdFromToken(token: string): string | null {
  try {
    const match = token.match(/mock-jwt-token-(\d+)-/)
    return match ? match[1] : null
  } catch (error) {
    return null
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.replace("Bearer ", "")
    const userId = getUserIdFromToken(token)

    if (!userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    // Filter messages by channel ID
    const channelMessages = mockMessages.filter((msg) => msg.channelId === params.id)

    return NextResponse.json(channelMessages)
  } catch (error) {
    console.error("Error fetching messages:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
