import { ObjectId } from "mongodb"
import { getDatabase } from "../mongodb"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

export interface User {
  _id?: ObjectId
  username: string
  email: string
  password: string
  avatar?: string
  createdAt: Date
  updatedAt: Date
}

export interface UserResponse {
  id: string
  username: string
  email: string
  avatar?: string
}

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export class UserModel {
  static async create(userData: Omit<User, "_id" | "createdAt" | "updatedAt">): Promise<UserResponse> {
    const db = await getDatabase()
    const users = db.collection<User>("users")

    // Check if user already exists
    const existingUser = await users.findOne({ email: userData.email })
    if (existingUser) {
      throw new Error("User already exists")
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 12)

    const newUser: Omit<User, "_id"> = {
      ...userData,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await users.insertOne(newUser)

    return {
      id: result.insertedId.toString(),
      username: userData.username,
      email: userData.email,
      avatar: userData.avatar,
    }
  }

  static async findByEmail(email: string): Promise<User | null> {
    const db = await getDatabase()
    const users = db.collection<User>("users")
    return await users.findOne({ email })
  }

  static async findById(id: string): Promise<UserResponse | null> {
    const db = await getDatabase()
    const users = db.collection<User>("users")

    const user = await users.findOne({ _id: new ObjectId(id) })
    if (!user) return null

    return {
      id: user._id!.toString(),
      username: user.username,
      email: user.email,
      avatar: user.avatar,
    }
  }

  static async validatePassword(user: User, password: string): Promise<boolean> {
    return await bcrypt.compare(password, user.password)
  }

  static generateToken(userId: string): string {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" })
  }

  static verifyToken(token: string): { userId: string } | null {
    try {
      return jwt.verify(token, JWT_SECRET) as { userId: string }
    } catch (error) {
      return null
    }
  }
}
