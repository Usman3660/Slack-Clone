"use client"

import type React from "react"

import { useState, useRef, useEffect, useCallback } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useChat } from "@/contexts/chat-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Hash, Send, Users, ArrowLeft } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

export function ChatArea() {
  const { user } = useAuth()
  const { currentChannel, messages, sendMessage, setCurrentChannel, typingUsers, emitTyping, emitStopTyping } =
    useChat()
  const [newMessage, setNewMessage] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Filter typing users for the current channel, excluding the current user
  const currentChannelTypingUsers = typingUsers.filter(
    (u) => u.channelId === currentChannel?.id && u.userId !== user?.id,
  )

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    const success = await sendMessage(newMessage)
    if (success) {
      setNewMessage("")
      // Stop typing indicator immediately after sending message
      if (user && currentChannel) {
        emitStopTyping(currentChannel.id, user.id)
      }
    }
  }

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setNewMessage(e.target.value)

      if (!user || !currentChannel) return

      // Emit typing event
      if (e.target.value.length > 0) {
        emitTyping(currentChannel.id, user.id, user.username)
        // Clear any existing timeout to prevent premature stopTyping
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current)
        }
        // Set a new timeout to stop typing after a short delay
        typingTimeoutRef.current = setTimeout(() => {
          emitStopTyping(currentChannel.id, user.id)
        }, 3000) // Stop typing after 3 seconds of no input
      } else {
        // If input is empty, immediately stop typing
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current)
        }
        emitStopTyping(currentChannel.id, user.id)
      }
    },
    [user, currentChannel, emitTyping, emitStopTyping],
  )

  // Clean up timeout on unmount or channel change
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
      // Ensure stop typing is emitted if component unmounts while typing
      if (user && currentChannel && newMessage.length > 0) {
        emitStopTyping(currentChannel.id, user.id)
      }
    }
  }, [currentChannel, user, newMessage, emitStopTyping])

  if (!currentChannel) return null

  return (
    <div className="flex flex-col h-full">
      {/* Channel Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" onClick={() => setCurrentChannel(null)} className="md:hidden">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Hash className="h-5 w-5 text-gray-500" />
            <div>
              <h1 className="text-lg font-semibold">{currentChannel.name}</h1>
              {currentChannel.description && <p className="text-sm text-gray-500">{currentChannel.description}</p>}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => setCurrentChannel(null)} className="hidden md:flex">
              Back to Dashboard
            </Button>
            <Badge variant="secondary" className="flex items-center space-x-1">
              <Users className="h-3 w-3" />
              <span>{currentChannel.members.length}</span>
            </Badge>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4 custom-scrollbar">
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className="flex space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-blue-600 text-white text-sm">
                  {message.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-sm">{message.username}</span>
                  <span className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-sm text-gray-900 mt-1 break-words">{message.content}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <Input
            placeholder={`Message #${currentChannel.name}`}
            value={newMessage}
            onChange={handleInputChange} // Use the new handler
            className="flex-1"
          />
          <Button type="submit" disabled={!newMessage.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
        {currentChannelTypingUsers.length > 0 && (
          <div className="mt-2 text-sm text-gray-500 animate-pulse">
            {currentChannelTypingUsers.map((u) => u.username).join(", ")} is typing...
          </div>
        )}
      </div>
    </div>
  )
}
