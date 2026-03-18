import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const s = localStorage.getItem('chatapp_user')
    return s ? JSON.parse(s) : null
  })

  const signIn = (userData, token) => {
    localStorage.setItem('chatapp_token', token)
    localStorage.setItem('chatapp_user', JSON.stringify(userData))
    setUser(userData)
  }

  const signOut = () => {
    localStorage.removeItem('chatapp_token')
    localStorage.removeItem('chatapp_user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
