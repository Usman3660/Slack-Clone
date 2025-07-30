"use client"

import { useAuth } from "@/contexts/auth-context"
import { useChat } from "@/contexts/chat-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare, Hash, Users, Plus } from "lucide-react"

export function WelcomeScreen() {
  const { user } = useAuth()
  const { channels, joinedChannels, joinChannel } = useChat()

  const availableChannels = channels.filter((channel) => !joinedChannels.includes(channel.id)).slice(0, 3)

  const handleJoinChannel = async (channelId: string) => {
    await joinChannel(channelId)
  }

  return (
    <div className="flex-1 flex items-center justify-center bg-gray-50 p-8">
      <div className="max-w-2xl w-full text-center space-y-8">
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="bg-blue-600 p-4 rounded-full">
              <MessageSquare className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome to TeamChat, {user?.username}!</h1>
          <p className="text-lg text-gray-600">Start collaborating with your team by joining or creating channels.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Hash className="h-5 w-5" />
                <span>Join Channels</span>
              </CardTitle>
              <CardDescription>Connect with your team in existing channels</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {availableChannels.length > 0 ? (
                availableChannels.map((channel) => (
                  <div key={channel.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Hash className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">{channel.name}</span>
                    </div>
                    <Button size="sm" onClick={() => handleJoinChannel(channel.id)}>
                      Join
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No available channels to join</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Plus className="h-5 w-5" />
                <span>Create Channel</span>
              </CardTitle>
              <CardDescription>Start a new conversation with your team</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Use the + button in the sidebar to create a new channel and invite your team members.
              </p>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Users className="h-4 w-4" />
                <span>{channels.length} total channels</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">Getting Started Tips</h3>
          <ul className="text-sm text-blue-800 space-y-1 text-left">
            <li>• Use the sidebar to browse and join channels</li>
            <li>• Create channels for different topics or teams</li>
            <li>• Click on a channel to start chatting</li>
            <li>• Use @ mentions to notify specific team members</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
