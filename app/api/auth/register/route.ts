import { type NextRequest, NextResponse } from "next/server"

// Mock users database (shared with login route)
const mockUsers = [
  {
    id: "1",
    username: "john_doe",
    email: "john@example.com",
    password: "password123",
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
    const { username, email, password } = await request.json()

    // Validation
    if (!username || !email || !password) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = mockUsers.find((u) => u.email === email)
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 })
    }

    // Create new user
    const newUser = {
      id: (mockUsers.length + 1).toString(),
      username,
      email,
      password, // In real app, hash this
      avatar: undefined,
    }

    mockUsers.push(newUser)

    // Generate mock token
    const token = `mock-jwt-token-${newUser.id}-${Date.now()}`

    return NextResponse.json({
      token,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        avatar: newUser.avatar,
      },
    })
  } catch (error) {
    console.error("Register error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
