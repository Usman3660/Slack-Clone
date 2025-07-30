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
      console.log("Auth: No or malformed Authorization header.") // Added logging
      return null
    }

    const token = authHeader.replace("Bearer ", "")
    console.log("Auth: Received token:", token) // Added logging

    const decoded = UserModel.verifyToken(token)

    if (!decoded) {
      console.log("Auth: Token verification failed.") // Added logging
      return null
    }
    console.log("Auth: Token decoded:", decoded) // Added logging

    // Verify user still exists
    const user = await UserModel.findById(decoded.userId)
    if (!user) {
      console.log("Auth: User not found for decoded ID:", decoded.userId) // Added logging
      return null
    }
    console.log("Auth: User found:", user.username) // Added logging

    return { userId: decoded.userId }
  } catch (error) {
    console.error("Auth middleware error:", error)
    return null
  }
}
