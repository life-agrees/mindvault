import React, { useEffect, useRef } from 'react'
import { Bot, User } from 'lucide-react'

type Msg = { role: 'user' | 'assistant' | 'system'; content: string }

interface Props {
  messages: Msg[]
  loading?: boolean
}

export default function MessageList({ messages, loading }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const chatMessages = messages.filter(m => m.role !== 'system')

  if (chatMessages.length === 0 && !loading) {
    return (
      <div className="chat-empty">
        <div className="chat-empty-icon">🧠</div>
        <h2>Your memories await</h2>
        <p>
          Start a conversation. MindVault will remember everything — encrypted and stored permanently on the 0G decentralized network.
        </p>
      </div>
    )
  }

  return (
    <div className="chat-area">
      {chatMessages.map((m, i) => (
        <div key={i} className={`message-row ${m.role}`}>
          <div className={`avatar ${m.role === 'assistant' ? 'ai' : 'user'}`}>
            {m.role === 'assistant' ? '🧠' : <User size={14} />}
          </div>
          <div className={`bubble ${m.role === 'assistant' ? 'ai' : 'user'}`}>
            {m.content || (
              <div className="typing-dots">
                <div className="typing-dot" />
                <div className="typing-dot" />
                <div className="typing-dot" />
              </div>
            )}
          </div>
        </div>
      ))}

      {loading && (
        <div className="message-row">
          <div className="avatar ai">🧠</div>
          <div className="bubble ai">
            <div className="typing-dots">
              <div className="typing-dot" />
              <div className="typing-dot" />
              <div className="typing-dot" />
            </div>
          </div>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  )
}
