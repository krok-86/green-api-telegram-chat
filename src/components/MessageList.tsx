import { useEffect, useRef } from 'react'
import type { ChatMessage } from '../types/chat'

interface MessageListProps {
  messages: ChatMessage[]
}

function formatTime(timestamp: number): string {
  return new Intl.DateTimeFormat('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(timestamp)
}

export function MessageList({ messages }: MessageListProps) {
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="messages" role="log" aria-live="polite">
      {messages.length === 0 ? (
        <p className="empty">Сообщений пока нет</p>
      ) : (
        messages.map((message) => (
          <article key={message.id} className={`bubble ${message.direction}`}>
            <p>{message.text}</p>
            <time dateTime={new Date(message.timestamp).toISOString()}>
              {formatTime(message.timestamp)}
            </time>
          </article>
        ))
      )}
      <div ref={endRef} />
    </div>
  )
}
