// MongoDB Setup Script
// Run this in MongoDB shell or MongoDB Compass

// Declare the db variable and connect to the 'slack' database
const db = db.getSiblingDB("slack") // Changed from "teamchat" to "slack"

// Create users collection with indexes
db.createCollection("users")
db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ username: 1 })

// Create channels collection with indexes
db.createCollection("channels")
db.channels.createIndex({ name: 1 }, { unique: true })
db.channels.createIndex({ createdBy: 1 })
db.channels.createIndex({ members: 1 })

// Create messages collection with indexes
db.createCollection("messages")
db.messages.createIndex({ channelId: 1, timestamp: -1 })
db.messages.createIndex({ userId: 1 })
db.messages.createIndex({ timestamp: -1 })

// Insert sample users
const users = db.users.insertMany([
  {
    username: "john_doe",
    email: "john@example.com",
    password: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6hsxq/3Haa", // password123
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    username: "jane_smith",
    email: "jane@example.com",
    password: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6hsxq/3Haa", // password123
    createdAt: new Date(),
    updatedAt: new Date(),
  },
])

// Get user IDs for reference
const john = users.insertedIds[0]
const jane = users.insertedIds[1]

// Insert sample channels
const channels = db.channels.insertMany([
  {
    name: "general",
    description: "General discussion for the team",
    members: [john, jane],
    createdBy: john,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: "random",
    description: "Random conversations and fun stuff",
    members: [john],
    createdBy: john,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: "development",
    description: "Development discussions and updates",
    members: [jane],
    createdBy: jane,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
])

// Get channel ID for sample messages
const generalChannel = channels.insertedIds[0]

// Insert sample messages
db.messages.insertMany([
  {
    content: "Welcome to the general channel! 👋",
    userId: john,
    channelId: generalChannel,
    timestamp: new Date(Date.now() - 3600000), // 1 hour ago
  },
  {
    content: "Thanks! Excited to be here and start collaborating.",
    userId: jane,
    channelId: generalChannel,
    timestamp: new Date(Date.now() - 3000000), // 50 minutes ago
  },
  {
    content: "Let's build something amazing together! 🚀",
    userId: john,
    channelId: generalChannel,
    timestamp: new Date(Date.now() - 1800000), // 30 minutes ago
  },
])

print("Database setup completed successfully!")
