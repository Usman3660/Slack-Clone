import { ObjectId } from "mongodb"
import { getDatabase } from "../mongodb"

export interface Channel {
  _id?: ObjectId
  name: string
  description?: string
  members: ObjectId[]
  createdBy: ObjectId
  createdAt: Date
  updatedAt: Date
}

export interface ChannelResponse {
  id: string
  name: string
  description?: string
  members: string[]
  createdBy: string
  createdAt: Date
}

export class ChannelModel {
  static async create(channelData: {
    name: string
    description?: string
    createdBy: string
  }): Promise<ChannelResponse> {
    const db = await getDatabase()
    const channels = db.collection<Channel>("channels")

    // Check if channel name already exists
    const existingChannel = await channels.findOne({ name: channelData.name })
    if (existingChannel) {
      throw new Error("Channel name already exists")
    }

    const createdById = new ObjectId(channelData.createdBy)
    const newChannel: Omit<Channel, "_id"> = {
      name: channelData.name,
      description: channelData.description,
      members: [createdById], // Creator automatically joins
      createdBy: createdById,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await channels.insertOne(newChannel)

    return {
      id: result.insertedId.toString(),
      name: newChannel.name,
      description: newChannel.description,
      members: [channelData.createdBy],
      createdBy: channelData.createdBy,
      createdAt: newChannel.createdAt,
    }
  }

  static async findAll(): Promise<ChannelResponse[]> {
    const db = await getDatabase()
    const channels = db.collection<Channel>("channels")

    const channelList = await channels.find({}).sort({ createdAt: -1 }).toArray()

    return channelList.map((channel) => ({
      id: channel._id!.toString(),
      name: channel.name,
      description: channel.description,
      members: channel.members.map((id) => id.toString()),
      createdBy: channel.createdBy.toString(),
      createdAt: channel.createdAt,
    }))
  }

  static async findById(id: string): Promise<ChannelResponse | null> {
    const db = await getDatabase()
    const channels = db.collection<Channel>("channels")

    const channel = await channels.findOne({ _id: new ObjectId(id) })
    if (!channel) return null

    return {
      id: channel._id!.toString(),
      name: channel.name,
      description: channel.description,
      members: channel.members.map((id) => id.toString()),
      createdBy: channel.createdBy.toString(),
      createdAt: channel.createdAt,
    }
  }

  static async findByUserId(userId: string): Promise<string[]> {
    const db = await getDatabase()
    const channels = db.collection<Channel>("channels")

    const userObjectId = new ObjectId(userId)
    const userChannels = await channels
      .find({
        members: { $in: [userObjectId] },
      })
      .toArray()

    return userChannels.map((channel) => channel._id!.toString())
  }

  static async addMember(channelId: string, userId: string): Promise<boolean> {
    const db = await getDatabase()
    const channels = db.collection<Channel>("channels")

    const userObjectId = new ObjectId(userId)
    const result = await channels.updateOne(
      { _id: new ObjectId(channelId) },
      {
        $addToSet: { members: userObjectId },
        $set: { updatedAt: new Date() },
      },
    )

    return result.modifiedCount > 0
  }

  static async removeMember(channelId: string, userId: string): Promise<boolean> {
    const db = await getDatabase()
    const channels = db.collection<Channel>("channels")

    const userObjectId = new ObjectId(userId)
    const result = await channels.updateOne(
      { _id: new ObjectId(channelId) },
      {
        $pull: { members: userObjectId },
        $set: { updatedAt: new Date() },
      },
    )

    return result.modifiedCount > 0
  }

  static async delete(channelId: string, userId: string): Promise<boolean> {
    const db = await getDatabase()
    const channels = db.collection<Channel>("channels")

    // Only allow creator to delete
    const result = await channels.deleteOne({
      _id: new ObjectId(channelId),
      createdBy: new ObjectId(userId),
    })

    if (result.deletedCount > 0) {
      // Also delete all messages in this channel
      const messages = db.collection("messages")
      await messages.deleteMany({ channelId: new ObjectId(channelId) })
    }

    return result.deletedCount > 0
  }
}
