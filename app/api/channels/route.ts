import { type NextRequest, NextResponse } from "next/server"
import { ChannelModel } from "@/lib/models/Channel"
import { authenticateToken } from "@/lib/middleware/auth"

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateToken(request)
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const channels = await ChannelModel.findAll()
    return NextResponse.json(channels)
  } catch (error) {
    console.error("Error fetching channels:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateToken(request)
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, description } = await request.json()

    if (!name || name.trim() === "") {
      return NextResponse.json({ error: "Channel name is required" }, { status: 400 })
    }

    const channel = await ChannelModel.create({
      name: name.trim(),
      description,
      createdBy: auth.userId,
    })

    return NextResponse.json(channel)
  } catch (error: any) {
    console.error("Error creating channel:", error)

    if (error.message === "Channel name already exists") {
      return NextResponse.json({ error: "Channel name already exists" }, { status: 400 })
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
