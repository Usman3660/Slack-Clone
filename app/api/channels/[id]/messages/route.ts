import { type NextRequest, NextResponse } from "next/server"
import { MessageModel } from "@/lib/models/Message"
import { authenticateToken } from "@/lib/middleware/auth"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await authenticateToken(request)
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const messages = await MessageModel.findByChannelId(params.id)
    return NextResponse.json(messages)
  } catch (error) {
    console.error("Error fetching messages:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
