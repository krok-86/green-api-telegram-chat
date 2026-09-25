import { useState, type FormEvent } from 'react'
import { isValidPhone, normalizePhone } from '../hooks/useChat'
import type { GreenApiCredentials } from '../types/greenApi'

interface CredentialsFormProps {
  pending: boolean
  error: string | null
  onSubmit: (credentials: GreenApiCredentials, phone: string) => void
}

export function CredentialsForm({ pending, error, onSubmit }: CredentialsFormProps) {
  const [apiUrl, setApiUrl] = useState('')
  const [idInstance, setIdInstance] = useState('')
  const [apiTokenInstance, setApiTokenInstance] = useState('')
  const [phone, setPhone] = useState('')
  const [localError, setLocalError] = useState<string | null>(null)

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    const credentials: GreenApiCredentials = {
      apiUrl: apiUrl.trim(),
      idInstance: idInstance.trim(),
      apiTokenInstance: apiTokenInstance.trim(),
    }
    const normalizedPhone = normalizePhone(phone)

    if (!credentials.apiUrl || !credentials.idInstance || !credentials.apiTokenInstance) {
      setLocalError('Заполните apiUrl, idInstance и apiTokenInstance')
      return
    }

    try {
      const url = new URL(credentials.apiUrl)
      if (url.protocol !== 'https:' && url.protocol !== 'http:') {
        setLocalError('apiUrl должен начинаться с http:// или https://')
        return
      }
    } catch {
      setLocalError('Укажите корректный apiUrl')
      return
    }

    if (!/^\d+$/.test(credentials.idInstance)) {
      setLocalError('idInstance должен состоять из цифр')
      return
    }

    if (!isValidPhone(normalizedPhone)) {
      setLocalError('Номер должен содержать от 8 до 15 цифр в международном формате')
      return
    }

    setLocalError(null)
    onSubmit(credentials, normalizedPhone)
  }

  const message = localError ?? error

  return (
    <main className="gate">
      <form className="gate-card" onSubmit={handleSubmit}>
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">
            T
          </span>
          <div>
            <h1>Telegram</h1>
            <p>Текстовый чат через GREEN-API</p>
          </div>
        </div>

        <label>
          apiUrl
          <input
            name="apiUrl"
            value={apiUrl}
            autoComplete="off"
            placeholder="Адрес API из кабинета"
            onChange={(event) => setApiUrl(event.target.value)}
          />
        </label>

        <label>
          idInstance
          <input
            name="idInstance"
            value={idInstance}
            inputMode="numeric"
            autoComplete="off"
            onChange={(event) => setIdInstance(event.target.value)}
          />
        </label>

        <label>
          apiTokenInstance
          <input
            name="apiTokenInstance"
            type="password"
            value={apiTokenInstance}
            autoComplete="off"
            onChange={(event) => setApiTokenInstance(event.target.value)}
          />
        </label>

        <label>
          Номер получателя
          <input
            name="phone"
            value={phone}
            inputMode="tel"
            autoComplete="tel"
            placeholder="79876543210"
            onChange={(event) => setPhone(event.target.value)}
          />
        </label>

        {message ? <p className="form-error">{message}</p> : null}

        <button type="submit" disabled={pending}>
          {pending ? 'Проверка номера…' : 'Открыть чат'}
        </button>
      </form>
    </main>
  )
}
