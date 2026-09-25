import { ChatView } from './components/ChatView'
import { CredentialsForm } from './components/CredentialsForm'
import { useChat } from './hooks/useChat'

function App() {
  const { session, messages, checking, sending, error, openChat, closeChat, send } = useChat()

  if (!session) {
    return <CredentialsForm pending={checking} error={error} onSubmit={openChat} />
  }

  return (
    <ChatView
      phone={session.phone}
      messages={messages}
      sending={sending}
      error={error}
      onSend={send}
      onClose={closeChat}
    />
  )
}

export default App
