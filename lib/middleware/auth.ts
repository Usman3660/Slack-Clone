import type { NextRequest } from "next/server"
import { UserModel } from "../models/User"

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string
    username: string
    email: string
  }
}

export async function authenticateToken(request: NextRequest): Promise<{ userId: string } | null> {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null
    }

    const token = authHeader.replace("Bearer ", "")
    const decoded = UserModel.verifyToken(token)

    if (!decoded) {
      return null
    }

    // Verify user still exists
    const user = await UserModel.findById(decoded.userId)
    if (!user) {
      return null
    }

    return { userId: decoded.userId }
  } catch (error) {
    console.error("Auth middleware error:", error)
    return null
  }
}
