import { type NextRequest, NextResponse } from "next/server"

// Mock user database (in real app, this would be in a database)
const users: any[] = []

export async function POST(request: NextRequest) {
  try {
    const { username, email, password } = await request.json()

    // Check if user already exists
    const existingUser = users.find((u) => u.email === email)
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 })
    }

    // Create new user
    const newUser = {
      id: Date.now().toString(),
      username,
      email,
      password, // In real app, this would be hashed
    }

    users.push(newUser)

    // Generate mock JWT token
    const token = `mock-jwt-token-${newUser.id}-${Date.now()}`

    return NextResponse.json({
      token,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
      },
    })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
