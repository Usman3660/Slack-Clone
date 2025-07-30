"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { ChatArea } from "@/components/chat-area"
import { WelcomeScreen } from "@/components/welcome-screen"
import { useChat } from "@/contexts/chat-context"

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const { currentChannel } = useChat()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login")
    }
  }, [user, loading, router])

  if (loading || !user) {
    return <div>Loading...</div>
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col">{currentChannel ? <ChatArea /> : <WelcomeScreen />}</div>
    </div>
  )
}
