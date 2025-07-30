import { type NextRequest, NextResponse } from "next/server"
import { ChannelModel } from "@/lib/models/Channel"
import { authenticateToken } from "@/lib/middleware/auth"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await authenticateToken(request)
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const success = await ChannelModel.delete(params.id, auth.userId)

    if (!success) {
      return NextResponse.json({ error: "Channel not found or unauthorized" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting channel:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
