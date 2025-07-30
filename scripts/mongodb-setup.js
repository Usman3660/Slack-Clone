// MongoDB Setup Script
// Run this in MongoDB shell or MongoDB Compass

// Create users collection with indexes
db.getSiblingDB("teamchat").users.createIndex({ email: 1 }, { unique: true })
db.getSiblingDB("teamchat").users.createIndex({ username: 1 })

// Create channels collection with indexes
db.getSiblingDB("teamchat").channels.createIndex({ name: 1 }, { unique: true })
db.getSiblingDB("teamchat").channels.createIndex({ createdBy: 1 })
db.getSiblingDB("teamchat").channels.createIndex({ members: 1 })

// Create messages collection with indexes
db.getSiblingDB("teamchat").messages.createIndex({ channelId: 1, timestamp: -1 })
db.getSiblingDB("teamchat").messages.createIndex({ userId: 1 })
db.getSiblingDB("teamchat").messages.createIndex({ timestamp: -1 })

// Insert sample data
const users = db.getSiblingDB("teamchat").users.insertMany([
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
const john = db.getSiblingDB("teamchat").users.findOne({ email: "john@example.com" })
const jane = db.getSiblingDB("teamchat").users.findOne({ email: "jane@example.com" })

// Insert sample channels
const channels = db.getSiblingDB("teamchat").channels.insertMany([
  {
    name: "general",
    description: "General discussion for the team",
    members: [john._id, jane._id],
    createdBy: john._id,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: "random",
    description: "Random conversations and fun stuff",
    members: [john._id],
    createdBy: john._id,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: "development",
    description: "Development discussions and updates",
    members: [jane._id],
    createdBy: jane._id,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
])

// Get channel ID for sample messages
const generalChannel = db.getSiblingDB("teamchat").channels.findOne({ name: "general" })

// Insert sample messages
const messages = db.getSiblingDB("teamchat").messages.insertMany([
  {
    content: "Welcome to the general channel! 👋",
    userId: john._id,
    channelId: generalChannel._id,
    timestamp: new Date(Date.now() - 3600000), // 1 hour ago
  },
  {
    content: "Thanks! Excited to be here and start collaborating.",
    userId: jane._id,
    channelId: generalChannel._id,
    timestamp: new Date(Date.now() - 3000000), // 50 minutes ago
  },
  {
    content: "Let's build something amazing together! 🚀",
    userId: john._id,
    channelId: generalChannel._id,
    timestamp: new Date(Date.now() - 1800000), // 30 minutes ago
  },
])

print("Database setup completed successfully!")
