import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useWebSocket } from '../hooks/useWebSocket'
import {
  getMyRooms, getPublicRooms, getMessages, createRoom,
  joinRoom, searchUsers, markRoomRead
} from '../services/api'
import {
  MessageSquare, Hash, Plus, Search, Send,
  LogOut, Users, Bell, X
} from 'lucide-react'
import { format, isToday, isYesterday } from 'date-fns'

const COLORS = ['#10b981','#3b82f6','#8b5cf6','#f59e0b','#ef4444','#06b6d4','#ec4899']

function Avatar({ user, size = 8 }) {
  const color = user?.avatarColor || COLORS[0]
  const initials = user?.username?.[0]?.toUpperCase() || '?'
  return (
    <div
      style={{ backgroundColor: color, width: `${size * 4}px`, height: `${size * 4}px` }}
      className="rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
    >
      {initials}
    </div>
  )
}

function formatMsgTime(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isToday(d)) return format(d, 'HH:mm')
  if (isYesterday(d)) return `Yesterday ${format(d, 'HH:mm')}`
  return format(d, 'dd MMM HH:mm')
}

export default function Chat() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const [myRooms, setMyRooms] = useState([])
  const [publicRooms, setPublicRooms] = useState([])
  const [activeRoom, setActiveRoom] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [unreadCounts, setUnreadCounts] = useState({})
  const [showNewRoom, setShowNewRoom] = useState(false)
  const [showDM, setShowDM] = useState(false)
  const [showExplore, setShowExplore] = useState(false)
  const [newRoomName, setNewRoomName] = useState('')
  const [dmSearch, setDmSearch] = useState('')
  const [dmResults, setDmResults] = useState([])
  const [notifications, setNotifications] = useState([])
  const [showNotifPanel, setShowNotifPanel] = useState(false)
  const messagesEndRef = useRef(null)

  const handleMessage = useCallback((msg) => {
    setMessages(prev => [...prev, msg])
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
  }, [])

  const handleNotification = useCallback((notif) => {
    setNotifications(prev => [notif, ...prev.slice(0, 9)])
    setUnreadCounts(prev => ({
      ...prev,
      [notif.roomId]: (prev[notif.roomId] || 0) + 1
    }))
  }, [])

  const { sendMessage, subscribeToRoom } = useWebSocket({
    onMessage: handleMessage,
    onNotification: handleNotification,
    onPresence: useCallback(() => {}, []),
  })

  const loadRooms = async () => {
    try {
      const [mine, pub] = await Promise.all([getMyRooms(), getPublicRooms()])
      setMyRooms(mine.data)
      setPublicRooms(pub.data)
    } catch (err) {
      console.error('loadRooms error:', err)
    }
  }

  useEffect(() => { loadRooms() }, [])

  const openRoom = async (room) => {
    setActiveRoom(room)
    subscribeToRoom(room.id)
    try {
      const { data } = await getMessages(room.id)
      setMessages(data)
      setUnreadCounts(prev => ({ ...prev, [room.id]: 0 }))
      await markRoomRead(room.id)
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'instant' }), 50)
    } catch (err) {
      console.error('openRoom error:', err)
    }
  }

  const handleSend = (e) => {
    e.preventDefault()
    if (!input.trim() || !activeRoom) return
    sendMessage(input.trim(), activeRoom.id)
    setInput('')
  }

  const handleCreateRoom = async () => {
    if (!newRoomName.trim()) return
    try {
      const { data } = await createRoom({ name: newRoomName, privateDm: false, description: '' })
      setShowNewRoom(false)
      setNewRoomName('')
      await loadRooms()
      openRoom(data)
    } catch (err) {
      console.error('createRoom error:', err)
    }
  }

  const handleJoinRoom = async (room) => {
    try {
      const { data } = await joinRoom(room.id)
      setShowExplore(false)
      await loadRooms()
      openRoom(data)
    } catch (err) {
      console.error('joinRoom error:', err)
    }
  }

  const handleDM = async (targetUser) => {
    if (!targetUser || !targetUser.id) return
    try {
      const { data } = await createRoom({ privateDm: true, targetUserId: targetUser.id })
      setShowDM(false)
      setDmSearch('')
      setDmResults([])
      await loadRooms()
      openRoom(data)
    } catch (err) {
      console.error('DM error:', err)
    }
  }

  const handleDmSearch = async (q) => {
    setDmSearch(q)
    if (q.length < 2) return setDmResults([])
    try {
      const { data } = await searchUsers(q)
      setDmResults(data.filter(u => u.id !== user.id))
    } catch (err) {
      console.error('search error:', err)
    }
  }

  const handleLogout = () => { signOut(); navigate('/login') }

  const getDmPartner = (room) => {
    if (!room.isPrivate || !room.members) return null
    return room.members.find(m => m.id !== user.id)
  }

  const joinedRoomIds = new Set(myRooms.map(r => r.id))
  const exploreRooms = publicRooms.filter(r => !joinedRoomIds.has(r.id))
  const totalUnread = Object.values(unreadCounts).reduce((s, c) => s + c, 0)

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">

      {/* Sidebar */}
      <aside className="w-64 flex flex-col bg-slate-900 border-r border-slate-800 flex-shrink-0">
        <div className="flex items-center justify-between px-4 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-emerald-500 rounded-lg flex items-center justify-center">
              <MessageSquare size={14} className="text-slate-900" />
            </div>
            <span className="font-semibold text-white text-sm">ChatApp</span>
          </div>
          <button onClick={() => setShowNotifPanel(!showNotifPanel)}
            className="relative p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors">
            <Bell size={15} />
            {totalUnread > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-emerald-500 text-slate-900 text-xs font-bold rounded-full flex items-center justify-center">
                {totalUnread > 9 ? '9+' : totalUnread}
              </span>
            )}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
          {/* Channels */}
          <div>
            <div className="flex items-center justify-between px-2 mb-1">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Channels</span>
              <div className="flex gap-1">
                <button onClick={() => setShowExplore(true)} title="Explore"
                  className="p-0.5 text-slate-500 hover:text-slate-300 transition-colors">
                  <Search size={12} />
                </button>
                <button onClick={() => setShowNewRoom(true)} title="New channel"
                  className="p-0.5 text-slate-500 hover:text-slate-300 transition-colors">
                  <Plus size={12} />
                </button>
              </div>
            </div>
            {myRooms.filter(r => !r.isPrivate).map(room => (
              <RoomItem key={room.id} room={room} active={activeRoom?.id === room.id}
                unread={unreadCounts[room.id] || 0} onClick={() => openRoom(room)} />
            ))}
          </div>

          {/* DMs */}
          <div>
            <div className="flex items-center justify-between px-2 mb-1">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Direct Messages</span>
              <button onClick={() => setShowDM(true)}
                className="p-0.5 text-slate-500 hover:text-slate-300 transition-colors">
                <Plus size={12} />
              </button>
            </div>
            {myRooms.filter(r => r.isPrivate).map(room => {
              const partner = getDmPartner(room)
              return (
                <button key={room.id} onClick={() => openRoom(room)}
                  className={`w-full flex items-center gap-2.5 px-2 py-2 rounded-lg text-left transition-colors ${
                    activeRoom?.id === room.id ? 'bg-emerald-500/10 text-emerald-400' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}>
                  <div className="relative">
                    <Avatar user={partner} size={6} />
                    {partner?.online && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full border border-slate-900" />
                    )}
                  </div>
                  <span className="text-sm truncate">{partner?.username || 'Unknown'}</span>
                  {(unreadCounts[room.id] || 0) > 0 && (
                    <span className="ml-auto bg-emerald-500 text-slate-900 text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0">
                      {unreadCounts[room.id]}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        <div className="border-t border-slate-800 px-3 py-3 flex items-center gap-2">
          <Avatar user={user} size={7} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-300 truncate">{user?.username}</p>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
              <span className="text-xs text-slate-500">Online</span>
            </div>
          </div>
          <button onClick={handleLogout} className="p-1.5 text-slate-500 hover:text-red-400 transition-colors">
            <LogOut size={14} />
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {activeRoom ? (
          <>
            <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-800 bg-slate-950">
              {activeRoom.isPrivate ? (
                <>
                  <Avatar user={getDmPartner(activeRoom)} size={8} />
                  <div>
                    <p className="font-semibold text-white text-sm">{getDmPartner(activeRoom)?.username}</p>
                    <p className="text-xs">
                      {getDmPartner(activeRoom)?.online
                        ? <span className="text-emerald-400">● Online</span>
                        : <span className="text-slate-500">○ Offline</span>}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
                    <Hash size={15} className="text-slate-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">{activeRoom.name}</p>
                    {activeRoom.description && <p className="text-xs text-slate-500">{activeRoom.description}</p>}
                  </div>
                  <div className="ml-auto flex items-center gap-1 text-xs text-slate-500">
                    <Users size={12} />
                    <span>{activeRoom.members?.length || 0}</span>
                  </div>
                </>
              )}
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center mb-3">
                    <MessageSquare size={22} className="text-slate-600" />
                  </div>
                  <p className="text-slate-400 text-sm">No messages yet</p>
                  <p className="text-slate-600 text-xs mt-1">Be the first to say something!</p>
                </div>
              ) : messages.map((msg, i) => {
                const isMe = msg.sender?.id === user.id
                const prevMsg = messages[i - 1]
                const showHeader = !prevMsg || prevMsg.sender?.id !== msg.sender?.id
                return (
                  <div key={msg.id || i} className={`flex gap-3 msg-enter ${showHeader ? 'mt-4' : 'mt-0.5'}`}>
                    <div style={{ width: '32px', flexShrink: 0 }} className="flex items-start justify-center pt-0.5">
                      {showHeader && <Avatar user={msg.sender} size={8} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      {showHeader && (
                        <div className="flex items-baseline gap-2 mb-0.5">
                          <span className={`text-sm font-semibold ${isMe ? 'text-emerald-400' : 'text-slate-200'}`}>
                            {msg.sender?.username}
                          </span>
                          <span className="text-xs text-slate-600">{formatMsgTime(msg.createdAt)}</span>
                        </div>
                      )}
                      <p className="text-sm text-slate-300 leading-relaxed break-words">{msg.content}</p>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>

            <div className="px-6 py-4 border-t border-slate-800">
              <form onSubmit={handleSend}
                className="flex items-center gap-3 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 focus-within:border-emerald-500 transition-colors">
                <input value={input} onChange={e => setInput(e.target.value)}
                  placeholder={`Message ${activeRoom.isPrivate ? getDmPartner(activeRoom)?.username : '#' + activeRoom.name}...`}
                  className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none" />
                <button type="submit" disabled={!input.trim()}
                  className="w-8 h-8 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-30 disabled:cursor-not-allowed text-slate-900 rounded-lg flex items-center justify-center transition-colors flex-shrink-0">
                  <Send size={14} />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <MessageSquare size={30} className="text-slate-600" />
              </div>
              <p className="text-slate-400 font-medium">Select a channel or DM to start chatting</p>
              <p className="text-slate-600 text-sm mt-1">Or create a new channel with the + button</p>
            </div>
          </div>
        )}
      </main>

      {/* Notifications panel */}
      {showNotifPanel && (
        <div className="w-72 bg-slate-900 border-l border-slate-800 flex flex-col">
          <div className="flex items-center justify-between px-4 py-4 border-b border-slate-800">
            <span className="font-semibold text-white text-sm">Notifications</span>
            <button onClick={() => setShowNotifPanel(false)} className="text-slate-500 hover:text-slate-300">
              <X size={16} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-slate-800">
            {notifications.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-sm">No notifications</div>
            ) : notifications.map((n, i) => (
              <div key={i} className="px-4 py-3 hover:bg-slate-800 cursor-pointer"
                onClick={() => {
                  setShowNotifPanel(false)
                  const room = myRooms.find(r => r.id === n.roomId)
                  if (room) openRoom(room)
                }}>
                <p className="text-xs text-emerald-400 font-medium mb-0.5">#{n.roomName}</p>
                <p className="text-xs text-slate-400 font-medium">{n.message?.sender?.username}</p>
                <p className="text-xs text-slate-500 truncate mt-0.5">{n.message?.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: New Channel */}
      {showNewRoom && (
        <Modal title="New Channel" onClose={() => { setShowNewRoom(false); setNewRoomName('') }}>
          <label className="text-xs text-slate-400 block mb-1.5">Channel name</label>
          <input value={newRoomName} onChange={e => setNewRoomName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleCreateRoom()}
            placeholder="general" autoFocus
            className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-sm rounded-lg px-3 py-2.5 focus:border-emerald-500 transition-colors mb-4" />
          <div className="flex gap-3">
            <button onClick={() => { setShowNewRoom(false); setNewRoomName('') }}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium py-2.5 rounded-lg transition-colors">
              Cancel
            </button>
            <button onClick={handleCreateRoom} disabled={!newRoomName.trim()}
              className="flex-1 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-900 text-sm font-semibold py-2.5 rounded-lg transition-colors">
              Create
            </button>
          </div>
        </Modal>
      )}

      {/* Modal: New DM */}
      {showDM && (
        <Modal title="New Direct Message" onClose={() => { setShowDM(false); setDmSearch(''); setDmResults([]) }}>
          <div className="relative mb-3">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input value={dmSearch} onChange={e => handleDmSearch(e.target.value)}
              placeholder="Search by username..." autoFocus
              className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-sm rounded-lg pl-9 pr-4 py-2.5 focus:border-emerald-500 transition-colors" />
          </div>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {dmResults.map(u => (
              <button key={u.id} onClick={() => handleDM(u)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 transition-colors text-left">
                <Avatar user={u} size={7} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-200 font-medium">{u.username}</p>
                  <p className="text-xs text-slate-500">{u.email}</p>
                </div>
                {u.online && <span className="w-2 h-2 bg-emerald-400 rounded-full flex-shrink-0" />}
              </button>
            ))}
            {dmSearch.length >= 2 && dmResults.length === 0 && (
              <p className="text-center text-slate-500 text-sm py-4">No users found</p>
            )}
          </div>
        </Modal>
      )}

      {/* Modal: Explore */}
      {showExplore && (
        <Modal title="Explore Channels" onClose={() => setShowExplore(false)}>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {exploreRooms.length === 0 ? (
              <p className="text-center text-slate-500 text-sm py-6">No public channels to join</p>
            ) : exploreRooms.map(room => (
              <div key={room.id} className="flex items-center gap-3 px-3 py-2.5 bg-slate-800 rounded-lg">
                <Hash size={14} className="text-slate-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-200 font-medium">{room.name}</p>
                  {room.description && <p className="text-xs text-slate-500 truncate">{room.description}</p>}
                </div>
                <button onClick={() => handleJoinRoom(room)}
                  className="text-xs bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-lg transition-colors flex-shrink-0">
                  Join
                </button>
              </div>
            ))}
          </div>
        </Modal>
      )}
    </div>
  )
}

function RoomItem({ room, active, unread, onClick }) {
  return (
    <button onClick={onClick}
      className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg text-left transition-colors ${
        active ? 'bg-emerald-500/10 text-emerald-400' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
      }`}>
      <Hash size={14} className="flex-shrink-0" />
      <span className="text-sm truncate flex-1">{room.name}</span>
      {unread > 0 && (
        <span className="bg-emerald-500 text-slate-900 text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0">
          {unread > 9 ? '9+' : unread}
        </span>
      )}
    </button>
  )
}

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-sm">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-white">{title}</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors">
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}