import axios from 'axios'
import type {
  CheckAccountFound,
  CheckAccountResponse,
  DeleteNotificationResponse,
  GreenApiCredentials,
  ReceiveNotificationResponse,
  SendMessageResponse,
} from '../types/greenApi'

const client = axios.create({
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
})

const RECEIVE_TIMEOUT_SECONDS = 20

function buildMethodUrl(
  credentials: GreenApiCredentials,
  method: string,
  suffix = '',
): string {
  const apiUrl = credentials.apiUrl.replace(/\/+$/, '')
  const idInstance = encodeURIComponent(credentials.idInstance)
  const apiTokenInstance = encodeURIComponent(credentials.apiTokenInstance)
  return `${apiUrl}/waInstance${idInstance}/${method}/${apiTokenInstance}${suffix}`
}

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data: unknown = error.response?.data
    if (typeof data === 'string' && data.trim()) return data
    if (data && typeof data === 'object') {
      if ('reason' in data && typeof data.reason === 'string' && data.reason) {
        return data.reason
      }
      if ('message' in data && typeof data.message === 'string' && data.message) {
        return data.message
      }
      if (
        'data' in data &&
        data.data &&
        typeof data.data === 'object' &&
        'reason' in data.data &&
        typeof data.data.reason === 'string' &&
        data.data.reason
      ) {
        return data.data.reason
      }
    }
    if (error.code === 'ECONNABORTED') return 'Превышено время ожидания ответа'
    if (!error.response) return 'Нет соединения с GREEN-API'
    return `Ошибка GREEN-API (${error.response.status})`
  }
  if (error instanceof Error && error.message) return error.message
  return 'Не удалось выполнить запрос'
}

export function isAbortError(error: unknown): boolean {
  return axios.isAxiosError(error) && error.code === 'ERR_CANCELED'
}

export async function checkAccount(
  credentials: GreenApiCredentials,
  phoneNumber: number,
  signal?: AbortSignal,
): Promise<CheckAccountFound> {
  const { data } = await client.post<CheckAccountResponse>(
    buildMethodUrl(credentials, 'checkAccount'),
    { phoneNumber },
    { signal },
  )

  if ('status' in data && data.status === false) {
    throw new Error(data.reason || data.data?.reason || 'Инстанс не готов к проверке номера')
  }

  if (!('exist' in data)) {
    throw new Error('Некорректный ответ CheckAccount')
  }

  return data
}

export async function sendMessage(
  credentials: GreenApiCredentials,
  chatId: string,
  message: string,
  signal?: AbortSignal,
): Promise<SendMessageResponse> {
  const { data } = await client.post<SendMessageResponse>(
    buildMethodUrl(credentials, 'sendMessage'),
    { chatId, message },
    { signal },
  )

  if (!data?.idMessage) {
    throw new Error('GREEN-API не вернул id сообщения')
  }

  return data
}

export async function receiveNotification(
  credentials: GreenApiCredentials,
  signal: AbortSignal,
): Promise<ReceiveNotificationResponse | null> {
  const { data } = await client.get<ReceiveNotificationResponse | null>(
    buildMethodUrl(credentials, 'receiveNotification'),
    {
      signal,
      timeout: (RECEIVE_TIMEOUT_SECONDS + 10) * 1000,
      params: { receiveTimeout: RECEIVE_TIMEOUT_SECONDS },
      transformResponse: [
        (body: string) => {
          if (!body) return null
          return JSON.parse(body) as ReceiveNotificationResponse | null
        },
      ],
    },
  )

  if (!data?.receiptId || !data.body) return null
  return data
}

export async function deleteNotification(
  credentials: GreenApiCredentials,
  receiptId: number,
  signal: AbortSignal,
): Promise<DeleteNotificationResponse> {
  const { data } = await client.delete<DeleteNotificationResponse>(
    buildMethodUrl(credentials, 'deleteNotification', `/${receiptId}`),
    { signal },
  )
  return data
}

export function delay(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(new DOMException('Aborted', 'AbortError'))
      return
    }

    const timer = window.setTimeout(() => {
      signal.removeEventListener('abort', onAbort)
      resolve()
    }, ms)

    const onAbort = () => {
      window.clearTimeout(timer)
      reject(new DOMException('Aborted', 'AbortError'))
    }

    signal.addEventListener('abort', onAbort, { once: true })
  })
}
