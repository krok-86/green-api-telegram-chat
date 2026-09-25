import { useEffect, useRef, useState } from 'react'
import {
  checkAccount,
  delay,
  deleteNotification,
  getErrorMessage,
  isAbortError,
  receiveNotification,
  sendMessage,
} from '../api/greenApi'
import type { ChatMessage, ChatSession } from '../types/chat'
import type { GreenApiCredentials, ReceiveNotificationResponse } from '../types/greenApi'

const PHONE_PATTERN = /^\d{8,15}$/

export function normalizePhone(value: string): string {
  return value.replace(/\D/g, '')
}

export function isValidPhone(phone: string): boolean {
  return PHONE_PATTERN.test(phone)
}

function readIncomingText(
  notification: ReceiveNotificationResponse,
  chatId: string,
): { id: string; text: string; timestamp: number } | null {
  const { body } = notification
  if (body.typeWebhook !== 'incomingMessageReceived') return null
  if (body.senderData.chatId !== chatId) return null
  if (body.messageData.typeMessage !== 'textMessage') return null

  const text = body.messageData.textMessageData?.textMessage
  if (!text) return null

  return {
    id: body.idMessage,
    text,
    timestamp: body.timestamp * 1000,
  }
}

export function useChat() {
  const [session, setSession] = useState<ChatSession | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [checking, setChecking] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const seenIds = useRef(new Set<string>())
  const sendingRef = useRef(false)
  const pollId = useRef(0)

  useEffect(() => {
    if (!session) return

    const controller = new AbortController()
    const currentPoll = ++pollId.current
    let stopped = false
    const { credentials, chatId } = session

    const loop = async () => {
      let pendingReceiptId: number | null = null

      while (!stopped && pollId.current === currentPoll) {
        try {
          if (pendingReceiptId !== null) {
            await deleteNotification(credentials, pendingReceiptId, controller.signal)
            pendingReceiptId = null
          }

          const notification = await receiveNotification(credentials, controller.signal)
          if (stopped || !notification) continue

          pendingReceiptId = notification.receiptId
          const incoming = readIncomingText(notification, chatId)
          if (incoming && !seenIds.current.has(incoming.id)) {
            seenIds.current.add(incoming.id)
            setMessages((current) => [
              ...current,
              {
                id: incoming.id,
                text: incoming.text,
                direction: 'incoming',
                timestamp: incoming.timestamp,
              },
            ])
          }

          await deleteNotification(credentials, pendingReceiptId, controller.signal)
          pendingReceiptId = null
          setError(null)
        } catch (caught) {
          if (stopped || isAbortError(caught) || controller.signal.aborted) return
          setError(getErrorMessage(caught))
          try {
            await delay(2000, controller.signal)
          } catch {
            return
          }
        }
      }
    }

    void loop()

    return () => {
      stopped = true
      controller.abort()
    }
  }, [session])

  const openChat = async (credentials: GreenApiCredentials, phone: string) => {
    setChecking(true)
    setError(null)

    try {
      const account = await checkAccount(credentials, Number(phone))
      if (!account.exist || !account.chatId) {
        setError('На этом номере нет аккаунта Telegram')
        return
      }

      seenIds.current.clear()
      setMessages([])
      setSession({ credentials, phone, chatId: account.chatId })
    } catch (caught) {
      if (!isAbortError(caught)) setError(getErrorMessage(caught))
    } finally {
      setChecking(false)
    }
  }

  const closeChat = () => {
    pollId.current += 1
    seenIds.current.clear()
    sendingRef.current = false
    setSession(null)
    setMessages([])
    setError(null)
    setSending(false)
  }

  const send = async (text: string): Promise<boolean> => {
    const current = session
    const message = text.trim()
    if (!current || !message || sendingRef.current) return false

    sendingRef.current = true
    setSending(true)
    setError(null)

    try {
      const response = await sendMessage(current.credentials, current.chatId, message)
      seenIds.current.add(response.idMessage)
      setMessages((items) => [
        ...items,
        {
          id: response.idMessage,
          text: message,
          direction: 'outgoing',
          timestamp: Date.now(),
        },
      ])
      return true
    } catch (caught) {
      if (!isAbortError(caught)) setError(getErrorMessage(caught))
      return false
    } finally {
      sendingRef.current = false
      setSending(false)
    }
  }

  return { session, messages, checking, sending, error, openChat, closeChat, send }
}
