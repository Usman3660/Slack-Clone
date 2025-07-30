import { type NextRequest, NextResponse } from "next/server"

// Mock user database
const users = [
  {
    id: "1",
    username: "john_doe",
    email: "john@example.com",
    password: "password123", // In real app, this would be hashed
  },
  {
    id: "2",
    username: "jane_smith",
    email: "jane@example.com",
    password: "password123",
  },
]

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Find user
    const user = users.find((u) => u.email === email && u.password === password)

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Generate mock JWT token
    const token = `mock-jwt-token-${user.id}-${Date.now()}`

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
