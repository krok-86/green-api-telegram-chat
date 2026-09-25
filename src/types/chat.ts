import type { GreenApiCredentials } from './greenApi'

export interface ChatSession {
  credentials: GreenApiCredentials
  phone: string
  chatId: string
}

export interface ChatMessage {
  id: string
  text: string
  direction: 'incoming' | 'outgoing'
  timestamp: number
}
