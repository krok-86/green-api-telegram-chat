# Telegram Chat — GREEN-API

Тестовое задание на позицию Frontend Developer React.

Простое веб-приложение для отправки и получения текстовых сообщений в Telegram через GREEN-API.

## Возможности

- подключение к GREEN-API Telegram instance;
- ввод `apiUrl`, `idInstance` и `apiTokenInstance`;
- проверка получателя через CheckAccount;
- открытие чата с найденным пользователем;
- отправка текстовых сообщений;
- получение входящих сообщений через HTTP API polling;
- удаление обработанных уведомлений через DeleteNotification;
- отображение входящих и исходящих сообщений;
- обработка ошибок API.

## Стек

- React
- TypeScript
- Vite
- Axios
- GREEN-API
- ESLint

## Запуск проекта

Требуется Node.js 20+.

Установите зависимости:

```bash
npm install

Запустите development server:

npm run dev

После запуска приложение будет доступно по адресу:

http://localhost:5173
Сборка

Для production-сборки:

npm run build
Использование
Создайте и авторизуйте Telegram instance в GREEN-API.
Введите в приложении:
apiUrl
idInstance
apiTokenInstance
номер телефона получателя
Нажмите «Открыть чат».
После проверки пользователя можно отправлять текстовые сообщения.
Входящие сообщения автоматически появляются в чате.
Работа с GREEN-API

Приложение использует следующие API-методы:

CheckAccount — проверка существования Telegram-пользователя;
SendMessage — отправка текстовых сообщений;
ReceiveNotification — получение входящих уведомлений;
DeleteNotification — удаление обработанных уведомлений.

Получение сообщений реализовано через HTTP API polling без использования собственного backend или webhook-сервера.

Архитектура

Основная логика разделена на:

src/api — работа с GREEN-API;
src/hooks — состояние чата и polling;
src/components — UI-компоненты;
src/types — TypeScript-типы API и данных чата.
Безопасность

Credentials GREEN-API не хранятся в исходном коде проекта и не должны добавляться в Git.

Для работы приложения используйте собственные credentials GREEN-API.

apiTokenInstance является секретным значением и не должен публиковаться в репозитории.

Ограничения

В рамках тестового задания поддерживаются только текстовые сообщения.

Не поддерживаются:

изображения;
файлы;
видео;
голосовые сообщения;
стикеры;
группы;
другие типы сообщений Telegram.
Автор

Konstantin Bykadorov

Frontend Developer / React / TypeScript