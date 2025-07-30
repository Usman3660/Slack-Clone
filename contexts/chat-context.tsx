"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useRef, useCallback } from "react"
import { useAuth } from "./auth-context"
import io from "socket.io-client" // Default import for io function
import type { Socket } from "socket.io-client" // Type import for Socket

interface Message {
  id: string
  content: string
  userId: string
  username: string
  channelId: string
  timestamp: Date
  avatar?: string
}

interface Channel {
  id: string
  name: string
  description?: string
  members: string[]
  createdBy: string
  createdAt: Date
}

interface TypingUser {
  userId: string
  username: string
  channelId: string
}

interface ChatContextType {
  channels: Channel[]
  currentChannel: Channel | null
  messages: Message[]
  joinedChannels: string[]
  typingUsers: TypingUser[] // New state for typing users
  setCurrentChannel: (channel: Channel | null) => void
  createChannel: (name: string, description?: string) => Promise<boolean>
  deleteChannel: (channelId: string) => Promise<boolean>
  joinChannel: (channelId: string) => Promise<boolean>
  leaveChannel: (channelId: string) => Promise<boolean>
  sendMessage: (content: string) => Promise<boolean>
  loadChannels: () => Promise<void>
  loadMessages: (channelId: string) => Promise<void>
  emitTyping: (channelId: string, userId: string, username: string) => void // New function
  emitStopTyping: (channelId: string, userId: string) => void // New function
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [channels, setChannels] = useState<Channel[]>([])
  const [currentChannel, setCurrentChannel] = useState<Channel | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [joinedChannels, setJoinedChannels] = useState<string[]>([])
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]) // Initialize typing users state

  const socketRef = useRef<Socket | null>(null)

  // Initialize Socket.IO client
  useEffect(() => {
    // Connect to the standalone Socket.IO server
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001")

    socket.on("connect", () => {
      console.log("Socket.IO client connected:", socket.id)
    })

    socket.on("receiveMessage", (newMessage: Message) => {
      console.log("Received new message via socket:", newMessage)
      // Explicitly convert timestamp string to Date object
      const messageWithCorrectTimestamp = {
        ...newMessage,
        timestamp: new Date(newMessage.timestamp),
      }
      setMessages((prev) => [...prev, messageWithCorrectTimestamp])
      // Remove user from typing list if they sent a message
      setTypingUsers((prev) =>
        prev.filter((u) => u.userId !== newMessage.userId || u.channelId !== newMessage.channelId),
      )
    })

    socket.on("userTyping", (data: TypingUser) => {
      console.log(`${data.username} is typing in ${data.channelId}`)
      setTypingUsers((prev) => {
        if (prev.some((u) => u.userId === data.userId && u.channelId === data.channelId)) {
          return prev // User already in typing list
        }
        return [...prev, data]
      })
    })

    socket.on("userStopTyping", (data: { userId: string; channelId: string }) => {
      console.log(`${data.userId} stopped typing in ${data.channelId}`)
      setTypingUsers((prev) => prev.filter((u) => u.userId !== data.userId || u.channelId !== data.channelId))
    })

    socket.on("disconnect", () => {
      console.log("Socket.IO client disconnected")
    })

    socketRef.current = socket

    return () => {
      socket.disconnect()
    }
  }, [])

  // Handle channel changes for Socket.IO rooms
  useEffect(() => {
    if (socketRef.current && user) {
      // Leave previous channel if any
      if (currentChannel) {
        socketRef.current.emit("leaveChannel", currentChannel.id)
        // Clear typing users for the left channel
        setTypingUsers((prev) => prev.filter((u) => u.channelId !== currentChannel.id))
      }
      // Join new channel
      if (currentChannel) {
        socketRef.current.emit("joinChannel", currentChannel.id)
      }
    }
  }, [currentChannel, user])

  useEffect(() => {
    if (user) {
      loadChannels()
      loadJoinedChannels()
    }
  }, [user])

  useEffect(() => {
    if (currentChannel) {
      loadMessages(currentChannel.id)
    }
  }, [currentChannel])

  const loadChannels = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        console.error("No token found")
        return
      }

      const response = await fetch("/api/channels", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        console.error("Failed to load channels:", response.status, response.statusText)
        return
      }

      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        console.error("Response is not JSON:", await response.text())
        return
      }

      const data = await response.json()
      setChannels(data)
    } catch (error) {
      console.error("Error loading channels:", error)
    }
  }

  const loadJoinedChannels = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        console.error("No token found")
        return
      }

      const response = await fetch("/api/channels/joined", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        console.error("Failed to load joined channels:", response.status, response.statusText)
        return
      }

      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        console.error("Response is not JSON:", await response.text())
        return
      }

      const data = await response.json()
      setJoinedChannels(data)
    } catch (error) {
      console.error("Error loading joined channels:", error)
    }
  }

  const loadMessages = async (channelId: string) => {
    try {
      const response = await fetch(`/api/channels/${channelId}/messages`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setMessages(data)
      }
    } catch (error) {
      console.error("Error loading messages:", error)
    }
  }

  const createChannel = async (name: string, description?: string): Promise<boolean> => {
    try {
      const response = await fetch("/api/channels", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ name, description }),
      })

      if (response.ok) {
        await loadChannels()
        return true
      }
      return false
    } catch (error) {
      console.error("Error creating channel:", error)
      return false
    }
  }

  const deleteChannel = async (channelId: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/channels/${channelId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      if (response.ok) {
        await loadChannels()
        if (currentChannel?.id === channelId) {
          setCurrentChannel(null)
        }
        return true
      }
      return false
    } catch (error) {
      console.error("Error deleting channel:", error)
      return false
    }
  }

  const joinChannel = async (channelId: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/channels/${channelId}/join`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      if (response.ok) {
        await loadJoinedChannels()
        await loadChannels()
        // Auto-select the newly joined channel
        const channel = channels.find((c) => c.id === channelId)
        if (channel) {
          setCurrentChannel(channel)
        }
        return true
      }
      return false
    } catch (error) {
      console.error("Error joining channel:", error)
      return false
    }
  }

  const leaveChannel = async (channelId: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/channels/${channelId}/leave`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      if (response.ok) {
        await loadJoinedChannels()
        await loadChannels()
        if (currentChannel?.id === channelId) {
          setCurrentChannel(null)
        }
        return true
      }
      return false
    } catch (error) {
      console.error("Error leaving channel:", error)
      return false
    }
  }

  const sendMessage = async (content: string): Promise<boolean> => {
    if (!currentChannel || !user) return false

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          content,
          channelId: currentChannel.id,
        }),
      })

      if (response.ok) {
        const newMessage = await response.json()
        socketRef.current?.emit("sendMessage", newMessage) // Emit message via socket
        emitStopTyping(currentChannel.id, user.id) // Stop typing after sending message
        return true
      }
      return false
    } catch (error) {
      console.error("Error sending message:", error)
      return false
    }
  }

  const emitTyping = useCallback((channelId: string, userId: string, username: string) => {
    if (socketRef.current) {
      socketRef.current.emit("typing", { channelId, userId, username })
    }
  }, [])

  const emitStopTyping = useCallback((channelId: string, userId: string) => {
    if (socketRef.current) {
      socketRef.current.emit("stopTyping", { channelId, userId })
    }
  }, [])

  return (
    <ChatContext.Provider
      value={{
        channels,
        currentChannel,
        messages,
        joinedChannels,
        typingUsers, // Provide typing users state
        setCurrentChannel,
        createChannel,
        deleteChannel,
        joinChannel,
        leaveChannel,
        sendMessage,
        loadChannels,
        loadMessages,
        emitTyping, // Provide emitTyping function
        emitStopTyping, // Provide emitStopTyping function
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider")
  }
  return context
}
