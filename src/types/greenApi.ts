export interface GreenApiCredentials {
  apiUrl: string
  idInstance: string
  apiTokenInstance: string
}

export interface CheckAccountFound {
  exist: boolean
  chatId: string
}

export interface CheckAccountRejected {
  status: false
  reason?: string
  data?: {
    reason?: string
  }
}

export type CheckAccountResponse = CheckAccountFound | CheckAccountRejected

export interface SendMessageResponse {
  idMessage: string
}

export interface TelegramSenderData {
  chatId: string
}

export interface TextMessageData {
  textMessage: string
}

export interface MessageData {
  typeMessage: string
  textMessageData?: TextMessageData
}

export interface TelegramNotificationBody {
  typeWebhook: string
  timestamp: number
  idMessage: string
  senderData: TelegramSenderData
  messageData: MessageData
}

export interface ReceiveNotificationResponse {
  receiptId: number
  body: TelegramNotificationBody
}

export interface DeleteNotificationResponse {
  result: boolean
  reason?: string
}
