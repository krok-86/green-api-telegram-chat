import { useRef, useState, type FormEvent } from 'react'

interface MessageInputProps {
  sending: boolean
  onSend: (text: string) => Promise<boolean>
}

export function MessageInput({ sending, onSend }: MessageInputProps) {
  const [text, setText] = useState('')
  const submitLock = useRef(false)

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    const message = text.trim()
    if (!message || sending || submitLock.current) return

    submitLock.current = true
    void onSend(message)
      .then((sent) => {
        if (sent) setText('')
      })
      .finally(() => {
        submitLock.current = false
      })
  }

  return (
    <form className="composer" onSubmit={handleSubmit}>
      <input
        value={text}
        maxLength={4096}
        placeholder="Сообщение"
        aria-label="Текст сообщения"
        onChange={(event) => setText(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault()
            event.currentTarget.form?.requestSubmit()
          }
        }}
      />
      <button
        type="submit"
        disabled={sending || !text.trim()}
        aria-busy={sending}
        aria-label={sending ? 'Отправка' : 'Отправить'}
      >
        {sending ? '…' : '➤'}
      </button>
    </form>
  )
}
