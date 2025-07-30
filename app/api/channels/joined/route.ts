import { type NextRequest, NextResponse } from "next/server"

// Mock channels database - make sure this matches the one in route.ts
const mockChannels = [
  {
    id: "1",
    name: "general",
    description: "General discussion for the team",
    members: ["1", "2"],
    createdBy: "1",
    createdAt: new Date("2024-01-01"),
  },
  {
    id: "2",
    name: "random",
    description: "Random conversations and fun stuff",
    members: ["1"],
    createdBy: "1",
    createdAt: new Date("2024-01-02"),
  },
  {
    id: "3",
    name: "development",
    description: "Development discussions and updates",
    members: ["2"],
    createdBy: "2",
    createdAt: new Date("2024-01-03"),
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

export async function GET(request: NextRequest) {
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

    // Find channels where user is a member
    const joinedChannelIds = mockChannels
      .filter((channel) => channel.members.includes(userId))
      .map((channel) => channel.id)

    return NextResponse.json(joinedChannelIds)
  } catch (error) {
    console.error("Error fetching joined channels:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
