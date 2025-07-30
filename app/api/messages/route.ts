import { type NextRequest, NextResponse } from "next/server"
import { MessageModel } from "@/lib/models/Message"
import { authenticateToken } from "@/lib/middleware/auth"

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateToken(request)
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { content, channelId } = await request.json()

    if (!content || content.trim() === "") {
      return NextResponse.json({ error: "Message content is required" }, { status: 400 })
    }

    if (!channelId) {
      return NextResponse.json({ error: "Channel ID is required" }, { status: 400 })
    }

    const newMessage = await MessageModel.create({
      content,
      userId: auth.userId,
      channelId,
    })

    return NextResponse.json(newMessage)
  } catch (error) {
    console.error("Error creating message:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
