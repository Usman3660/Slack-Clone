import { type NextRequest, NextResponse } from "next/server"

// Mock channels database
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

    return NextResponse.json(mockChannels)
  } catch (error) {
    console.error("Error fetching channels:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
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

    const { name, description } = await request.json()

    if (!name || name.trim() === "") {
      return NextResponse.json({ error: "Channel name is required" }, { status: 400 })
    }

    // Check if channel name already exists
    const existingChannel = mockChannels.find((c) => c.name === name.trim())
    if (existingChannel) {
      return NextResponse.json({ error: "Channel name already exists" }, { status: 400 })
    }

    const newChannel = {
      id: (mockChannels.length + 1).toString(),
      name: name.trim(),
      description,
      members: [userId], // Creator automatically joins
      createdBy: userId,
      createdAt: new Date(),
    }

    mockChannels.push(newChannel)

    return NextResponse.json(newChannel)
  } catch (error) {
    console.error("Error creating channel:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
