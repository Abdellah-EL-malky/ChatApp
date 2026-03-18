# 💬 ChatApp — Real-time Chat with WebSocket

![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2-6DB33F?logo=springboot&logoColor=white)
![WebSocket](https://img.shields.io/badge/WebSocket-STOMP-00C7B7)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-4169E1?logo=postgresql&logoColor=white)

A full-stack real-time chat application built with **Spring Boot WebSocket (STOMP)** and **React 18**. Supports channels, direct messages, notifications, and live presence — in a dark minimal UI.


---

## ✨ Features

- ⚡ **Real-time messaging** via WebSocket/STOMP + SockJS
- 💬 **Public channels** — create & join rooms like #general, #dev
- 🔒 **Direct messages** — private 1-on-1 conversations
- 🔔 **Push notifications** — unread badges per room, notification panel
- 🟢 **Live presence** — online/offline status updated in real-time
- 🔐 **JWT Authentication** — register/login with secure tokens
- 📜 **Message history** — persisted in PostgreSQL, loaded on room open

---

## 🛠️ Tech Stack

| Layer | Tech |
|-------|------|
| Backend | Spring Boot 3.2, Spring WebSocket, STOMP protocol |
| Auth | JWT (jjwt 0.11.5) |
| Real-time | SimpMessagingTemplate, STOMP broker |
| Frontend | React 18, Vite, Tailwind CSS |
| WS Client | @stomp/stompjs + SockJS |
| Database | PostgreSQL (Supabase prod, H2 dev) |
| Deployment | Render (backend) + Vercel (frontend) |

---

## 🚀 Getting Started

### Backend

```bash
cd backend
./mvnw spring-boot:run
# Runs on http://localhost:8080
# WebSocket endpoint: ws://localhost:8080/ws
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
# VITE_API_URL=http://localhost:8080
# VITE_WS_URL=http://localhost:8080/ws
npm run dev
```

---

## 📡 API Endpoints

```
POST /api/auth/register
POST /api/auth/login

GET  /api/users/me
GET  /api/users/search?q=
GET  /api/users/online

GET  /api/rooms/public
GET  /api/rooms/mine
POST /api/rooms
POST /api/rooms/{id}/join

GET  /api/rooms/{id}/messages

GET  /api/notifications
GET  /api/notifications/count
POST /api/notifications/read/room/{roomId}
```

## 🔌 WebSocket

```
CONNECT  ws://host/ws  (Bearer token in header)
SEND     /app/chat.send  { content, roomId }
SUB      /topic/room/{id}   → new messages
SUB      /user/queue/notifications → personal notifications
SUB      /topic/presence  → online/offline updates
```

---

## 🌐 Deployment

### Backend (Render — Docker)
```
DATABASE_URL=jdbc:postgresql://...
DATABASE_USERNAME=postgres.xxxx
DATABASE_PASSWORD=...
DATABASE_DRIVER=org.postgresql.Driver
HIBERNATE_DIALECT=org.hibernate.dialect.PostgreSQLDialect
JWT_SECRET=your-secret-key
```

### Frontend (Vercel)
```
VITE_API_URL=https://chatapp-api.onrender.com
VITE_WS_URL=https://chatapp-api.onrender.com/ws
```

---

## 👤 Author

**Abdellah El Malky** — Full-Stack Developer (Java/Spring Boot + React)  
📧 abdel.elmalky@gmail.com  
🐙 [github.com/Abdellah-EL-malky](https://github.com/Abdellah-EL-malky)
