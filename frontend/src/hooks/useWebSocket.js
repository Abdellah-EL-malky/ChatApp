import { useEffect, useRef, useCallback } from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client/dist/sockjs.min.js'

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:8080/ws'

export function useWebSocket({ onMessage, onNotification, onPresence, roomId }) {
  const clientRef = useRef(null)
  const subscriptionsRef = useRef([])

  const connect = useCallback(() => {
    const token = localStorage.getItem('chatapp_token')
    if (!token) return

    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 3000,
      onConnect: () => {
        // Room messages
        if (roomId) {
          const sub = client.subscribe(`/topic/room/${roomId}`, (frame) => {
            const msg = JSON.parse(frame.body)
            onMessage && onMessage(msg)
          })
          subscriptionsRef.current.push(sub)
        }

        // Personal notifications
        const notifSub = client.subscribe('/user/queue/notifications', (frame) => {
          const notif = JSON.parse(frame.body)
          onNotification && onNotification(notif)
        })
        subscriptionsRef.current.push(notifSub)

        // Online presence
        const presenceSub = client.subscribe('/topic/presence', (frame) => {
          const user = JSON.parse(frame.body)
          onPresence && onPresence(user)
        })
        subscriptionsRef.current.push(presenceSub)
      },
      onStompError: (frame) => console.error('STOMP error:', frame),
    })

    client.activate()
    clientRef.current = client
  }, [roomId])

  const sendMessage = useCallback((content, roomId) => {
    if (clientRef.current?.connected) {
      clientRef.current.publish({
        destination: '/app/chat.send',
        body: JSON.stringify({ content, roomId }),
      })
    }
  }, [])

  const subscribeToRoom = useCallback((newRoomId) => {
    if (!clientRef.current?.connected) return
    // Unsubscribe from old room subs
    subscriptionsRef.current.forEach(s => {
      try { s.unsubscribe() } catch (e) {}
    })
    subscriptionsRef.current = []

    const sub = clientRef.current.subscribe(`/topic/room/${newRoomId}`, (frame) => {
      const msg = JSON.parse(frame.body)
      onMessage && onMessage(msg)
    })
    subscriptionsRef.current.push(sub)
  }, [onMessage])

  useEffect(() => {
    connect()
    return () => {
      subscriptionsRef.current.forEach(s => { try { s.unsubscribe() } catch (e) {} })
      clientRef.current?.deactivate()
    }
  }, [])

  return { sendMessage, subscribeToRoom, client: clientRef }
}
