import type { ChatMessage } from '../types/chat'
import { MessageInput } from './MessageInput'
import { MessageList } from './MessageList'

interface ChatViewProps {
  phone: string
  messages: ChatMessage[]
  sending: boolean
  error: string | null
  onSend: (text: string) => Promise<boolean>
  onClose: () => void
}

export function ChatView({
  phone,
  messages,
  sending,
  error,
  onSend,
  onClose,
}: ChatViewProps) {
  return (
    <main className="chat">
      <header className="chat-header">
        <span className="avatar" aria-hidden="true">
          {phone.slice(-2)}
        </span>
        <div className="chat-title">
          <strong>+{phone}</strong>
          <span>{error ?? 'Telegram'}</span>
        </div>
        <button type="button" className="text-button" onClick={onClose}>
          Назад
        </button>
      </header>

      <MessageList messages={messages} />
      <MessageInput sending={sending} onSend={onSend} />
    </main>
  )
}
