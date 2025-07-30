import { type NextRequest, NextResponse } from "next/server"

// Mock users database
const mockUsers = [
  {
    id: "1",
    username: "john_doe",
    email: "john@example.com",
    password: "password123", // In real app, this would be hashed
    avatar: undefined,
  },
  {
    id: "2",
    username: "jane_smith",
    email: "jane@example.com",
    password: "password123",
    avatar: undefined,
  },
]

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Validation
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Find user in mock database
    const user = mockUsers.find((u) => u.email === email)
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Validate password (in real app, use bcrypt)
    if (user.password !== password) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Generate mock token
    const token = `mock-jwt-token-${user.id}-${Date.now()}`

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
