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

function getUserIdFromToken(token: string): string | null {
  const match = token.match(/mock-jwt-token-(\d+)-/)
  return match ? match[1] : null
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const channelMessages = messages
      .filter((message) => message.channelId === params.id)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

    return NextResponse.json(channelMessages)
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
