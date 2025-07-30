import { type NextRequest, NextResponse } from "next/server"
import { UserModel } from "@/lib/models/User"

export async function POST(request: NextRequest) {
  try {
    const { username, email, password } = await request.json()

    // Validation
    if (!username || !email || !password) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
    }

    // Create user
    const user = await UserModel.create({ username, email, password })
    const token = UserModel.generateToken(user.id)

    return NextResponse.json({
      token,
      user,
    })
  } catch (error: any) {
    console.error("Register error:", error)

    if (error.message === "User already exists") {
      return NextResponse.json({ error: "User already exists" }, { status: 400 })
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
