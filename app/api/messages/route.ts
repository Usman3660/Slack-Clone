import { type NextRequest, NextResponse } from "next/server"

// Mock messages database
const messages = [
  {
    id: "1",
    content: "Welcome to the general channel!",
    userId: "1",
    username: "john_doe",
    channelId: "1",
    timestamp: new Date("2024-01-01T10:00:00Z"),
  },
  {
    id: "2",
    content: "Thanks! Excited to be here.",
    userId: "2",
    username: "jane_smith",
    channelId: "1",
    timestamp: new Date("2024-01-01T10:05:00Z"),
  },
  {
    id: "3",
    content: "Let's start building something amazing!",
    userId: "1",
    username: "john_doe",
    channelId: "1",
    timestamp: new Date("2024-01-01T10:10:00Z"),
  },
]

// Mock users for username lookup
const users = [
  { id: "1", username: "john_doe" },
  { id: "2", username: "jane_smith" },
]

function getUserIdFromToken(token: string): string | null {
  const match = token.match(/mock-jwt-token-(\d+)-/)
  return match ? match[1] : null
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.replace("Bearer ", "")
    const userId = getUserIdFromToken(token)

    if (!userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const { content, channelId } = await request.json()

    const user = users.find((u) => u.id === userId)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const newMessage = {
      id: Date.now().toString(),
      content,
      userId,
      username: user.username,
      channelId,
      timestamp: new Date(),
    }

    messages.push(newMessage)

    return NextResponse.json(newMessage)
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
