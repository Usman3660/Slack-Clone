"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useAuth } from "./auth-context"

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

interface ChatContextType {
  channels: Channel[]
  currentChannel: Channel | null
  messages: Message[]
  joinedChannels: string[]
  setCurrentChannel: (channel: Channel | null) => void
  createChannel: (name: string, description?: string) => Promise<boolean>
  deleteChannel: (channelId: string) => Promise<boolean>
  joinChannel: (channelId: string) => Promise<boolean>
  leaveChannel: (channelId: string) => Promise<boolean>
  sendMessage: (content: string) => Promise<boolean>
  loadChannels: () => Promise<void>
  loadMessages: (channelId: string) => Promise<void>
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [channels, setChannels] = useState<Channel[]>([])
  const [currentChannel, setCurrentChannel] = useState<Channel | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [joinedChannels, setJoinedChannels] = useState<string[]>([])

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
        setMessages((prev) => [...prev, newMessage])
        return true
      }
      return false
    } catch (error) {
      console.error("Error sending message:", error)
      return false
    }
  }

  return (
    <ChatContext.Provider
      value={{
        channels,
        currentChannel,
        messages,
        joinedChannels,
        setCurrentChannel,
        createChannel,
        deleteChannel,
        joinChannel,
        leaveChannel,
        sendMessage,
        loadChannels,
        loadMessages,
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
