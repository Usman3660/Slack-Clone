import { ObjectId } from "mongodb"
import { getDatabase } from "../mongodb"

export interface Message {
  _id?: ObjectId
  content: string
  userId: ObjectId
  channelId: ObjectId
  timestamp: Date
  editedAt?: Date
}

export interface MessageResponse {
  id: string
  content: string
  userId: string
  username: string
  channelId: string
  timestamp: Date
  avatar?: string
}

export class MessageModel {
  static async create(messageData: {
    content: string
    userId: string
    channelId: string
  }): Promise<MessageResponse> {
    const db = await getDatabase()
    const messages = db.collection<Message>("messages")
    const users = db.collection("users")

    const userObjectId = new ObjectId(messageData.userId)
    const channelObjectId = new ObjectId(messageData.channelId)

    const newMessage: Omit<Message, "_id"> = {
      content: messageData.content,
      userId: userObjectId,
      channelId: channelObjectId,
      timestamp: new Date(),
    }

    const result = await messages.insertOne(newMessage)

    // Get user info for response
    const user = await users.findOne({ _id: userObjectId })

    return {
      id: result.insertedId.toString(),
      content: messageData.content,
      userId: messageData.userId,
      username: user?.username || "Unknown User",
      channelId: messageData.channelId,
      timestamp: newMessage.timestamp,
      avatar: user?.avatar,
    }
  }

  static async findByChannelId(channelId: string): Promise<MessageResponse[]> {
    const db = await getDatabase()
    const messages = db.collection<Message>("messages")

    const channelObjectId = new ObjectId(channelId)

    // Aggregate to join with users collection
    const messageList = await messages
      .aggregate([
        { $match: { channelId: channelObjectId } },
        { $sort: { timestamp: 1 } },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: "$user" },
        {
          $project: {
            _id: 1,
            content: 1,
            userId: 1,
            channelId: 1,
            timestamp: 1,
            username: "$user.username",
            avatar: "$user.avatar",
          },
        },
      ])
      .toArray()

    return messageList.map((message) => ({
      id: message._id.toString(),
      content: message.content,
      userId: message.userId.toString(),
      username: message.username,
      channelId: message.channelId.toString(),
      timestamp: message.timestamp,
      avatar: message.avatar,
    }))
  }

  static async delete(messageId: string, userId: string): Promise<boolean> {
    const db = await getDatabase()
    const messages = db.collection<Message>("messages")

    const result = await messages.deleteOne({
      _id: new ObjectId(messageId),
      userId: new ObjectId(userId),
    })

    return result.deletedCount > 0
  }

  static async update(messageId: string, userId: string, content: string): Promise<boolean> {
    const db = await getDatabase()
    const messages = db.collection<Message>("messages")

    const result = await messages.updateOne(
      {
        _id: new ObjectId(messageId),
        userId: new ObjectId(userId),
      },
      {
        $set: {
          content,
          editedAt: new Date(),
        },
      },
    )

    return result.modifiedCount > 0
  }
}
