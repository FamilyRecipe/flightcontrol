'use client'

import { useState, useEffect } from 'react'
import { ChatInterface } from '@/components/templates/interactive/ChatInterface'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LoadingState } from '@/components/templates/states/LoadingState'
import { ErrorState } from '@/components/templates/states/ErrorState'
import { MessageSquare, Bot, User } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  project_id?: string
}

interface ChatPageProps {
  projectId: string
}

export function ChatPage({ projectId }: ChatPageProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadMessages()
  }, [projectId])

  const loadMessages = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/chat?project_id=${projectId}`)
      if (!response.ok) {
        throw new Error('Failed to load messages')
      }
      const data = await response.json()
      setMessages(data.messages || [])
    } catch (err: any) {
      setError(err.message || 'Failed to load messages')
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async (content: string) => {
    setSending(true)
    setError(null)
    
    // Optimistically add user message
    const userMessage: Message = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
      project_id: projectId,
    }
    setMessages((prev) => [...prev, userMessage])

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          project_id: projectId,
          content,
          role: 'user',
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      const data = await response.json()
      
      // Remove temp message and add real messages
      setMessages((prev) => {
        const filtered = prev.filter((m) => m.id !== userMessage.id)
        return [...filtered, data.userMessage, data.assistantMessage]
      })
    } catch (err: any) {
      setError(err.message || 'Failed to send message')
      // Remove temp message on error
      setMessages((prev) => prev.filter((m) => m.id !== userMessage.id))
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return <LoadingState message="Loading chat..." />
  }

  if (error && messages.length === 0) {
    return <ErrorState error={error} retry={loadMessages} />
  }

  return (
    <div className="h-[calc(100vh-12rem)] flex flex-col">
      <Card className="flex-1 flex flex-col p-6">
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Project Chat</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Discuss misalignments, ask questions, and get help with your project plan.
          </p>
        </div>

        <div className="flex-1 min-h-0">
          <ChatInterface
            messages={messages.map((m) => ({
              id: m.id,
              role: m.role,
              content: m.content,
              timestamp: new Date(m.timestamp),
            }))}
            onSendMessage={handleSendMessage}
            isLoading={sending}
            placeholder="Ask about alignment, plan updates, or get help..."
          />
        </div>

        {error && messages.length > 0 && (
          <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md text-sm text-destructive">
            {error}
          </div>
        )}
      </Card>
    </div>
  )
}

