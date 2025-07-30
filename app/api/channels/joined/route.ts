import { type NextRequest, NextResponse } from "next/server"
import { ChannelModel } from "@/lib/models/Channel"
import { authenticateToken } from "@/lib/middleware/auth"

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateToken(request)
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const joinedChannelIds = await ChannelModel.findByUserId(auth.userId)
    return NextResponse.json(joinedChannelIds)
  } catch (error) {
    console.error("Error fetching joined channels:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
