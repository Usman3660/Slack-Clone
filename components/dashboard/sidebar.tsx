"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useChat } from "@/contexts/chat-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Hash, Plus, Settings, LogOut, MoreVertical, Trash2, UserPlus, UserMinus } from "lucide-react"

export function Sidebar() {
  const { user, logout } = useAuth()
  const {
    channels,
    currentChannel,
    joinedChannels,
    setCurrentChannel,
    createChannel,
    deleteChannel,
    joinChannel,
    leaveChannel,
  } = useChat()
  const { toast } = useToast()

  const [newChannelName, setNewChannelName] = useState("")
  const [newChannelDescription, setNewChannelDescription] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  const handleCreateChannel = async () => {
    if (!newChannelName.trim()) return

    const success = await createChannel(newChannelName, newChannelDescription)
    if (success) {
      toast({
        title: "Channel created",
        description: `#${newChannelName} has been created successfully.`,
      })
      setNewChannelName("")
      setNewChannelDescription("")
      setIsCreateDialogOpen(false)
    } else {
      toast({
        title: "Error",
        description: "Failed to create channel. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleJoinChannel = async (channelId: string) => {
    const success = await joinChannel(channelId)
    if (success) {
      toast({
        title: "Joined channel",
        description: "You have successfully joined the channel.",
      })
    }
  }

  const handleLeaveChannel = async (channelId: string) => {
    const success = await leaveChannel(channelId)
    if (success) {
      toast({
        title: "Left channel",
        description: "You have left the channel.",
      })
    }
  }

  const handleDeleteChannel = async (channelId: string) => {
    const success = await deleteChannel(channelId)
    if (success) {
      toast({
        title: "Channel deleted",
        description: "The channel has been deleted successfully.",
      })
    }
  }

  const joinedChannelsList = channels.filter((channel) => joinedChannels.includes(channel.id))

  const availableChannels = channels.filter((channel) => !joinedChannels.includes(channel.id))

  return (
    <div className="w-180 bg-slate-800 text-white flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">TeamChat</h1>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <ScrollArea className="flex-1 custom-scrollbar">
        <div className="p-4 space-y-6">
          {/* Joined Channels */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Channels</h2>
              {/* More visible Create Channel button */}
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-1 px-2 py-1">
                    <Plus className="h-4 w-4" />
                    <span className="text-xs font-medium">New Channel</span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create a new channel</DialogTitle>
                    <DialogDescription>Create a new channel for your team to collaborate.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Input
                        placeholder="Channel name"
                        value={newChannelName}
                        onChange={(e) => setNewChannelName(e.target.value)}
                      />
                    </div>
                    <div>
                      <Input
                        placeholder="Description (optional)"
                        value={newChannelDescription}
                        onChange={(e) => setNewChannelDescription(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateChannel}>Create Channel</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            <div className="space-y-1">
              <Button
                variant="ghost"
                className={`w-full justify-start text-left h-10 px-3 mb-2 ${
                  !currentChannel ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-700 hover:text-white"
                }`}
                onClick={() => setCurrentChannel(null)}
              >
                <Hash className="mr-3 h-4 w-4" />
                <span>Dashboard</span>
              </Button>
              {joinedChannelsList.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-sm text-slate-400 italic px-3 mb-2">No channels joined yet</p>
                  <p className="text-xs text-slate-400">Browse channels below or create a new one!</p>
                </div>
              ) : (
                joinedChannelsList.map((channel) => (
                  <div key={channel.id} className="group flex items-center hover:bg-slate-700 rounded-md">
                    <Button
                      variant="ghost"
                      className={`flex-1 justify-start text-left h-10 px-3 rounded-r-none ${
                        currentChannel?.id === channel.id
                          ? "bg-blue-600 text-white hover:bg-blue-600"
                          : "text-slate-300 hover:bg-transparent hover:text-white"
                      }`}
                      onClick={() => setCurrentChannel(channel)}
                    >
                      <Hash className="mr-3 h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{channel.name}</span>
                    </Button>
                    <div className="px-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-slate-600">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => handleLeaveChannel(channel.id)}>
                            <UserMinus className="mr-2 h-4 w-4" />
                            Leave Channel
                          </DropdownMenuItem>
                          {channel.createdBy === user?.id && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDeleteChannel(channel.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Channel
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Available Channels to Join */}
          {availableChannels.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wide mb-3">Browse Channels</h2>
              <div className="space-y-2">
                {availableChannels.map((channel) => (
                  <div key={channel.id} className="flex items-center justify-between p-3 rounded-md hover:bg-slate-700">
                    <div className="flex items-center flex-1 min-w-0">
                      <Hash className="mr-3 h-4 w-4 text-slate-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <span className="text-slate-300 truncate block font-medium">{channel.name}</span>
                        {channel.description && (
                          <span className="text-xs text-slate-400 truncate block">{channel.description}</span>
                        )}
                      </div>
                      <Badge variant="secondary" className="ml-2 text-xs flex-shrink-0">
                        {channel.members.length}
                      </Badge>
                    </div>
                    <Button
                      variant="default"
                      size="sm"
                      className="h-8 px-3 ml-2 text-white bg-blue-600 hover:bg-blue-700 flex-shrink-0"
                      onClick={() => handleJoinChannel(channel.id)}
                    >
                      <UserPlus className="h-4 w-4 mr-1" />
                      Join
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* User Info */}
      <div className="p-4 border-t border-slate-700">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-blue-600 text-white">{user?.username.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.username}</p>
            <p className="text-xs text-slate-400 truncate">{user?.email}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
