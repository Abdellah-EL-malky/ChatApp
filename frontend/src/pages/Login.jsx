import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { login } from '../services/api'
import { MessageSquare, Mail, Lock, ArrowRight } from 'lucide-react'

const DEMO_USER = { email: 'demo@chatapp.com', password: 'demo1234', username: 'demo', avatarColor: '#10b981' }

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const handle = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const { data } = await login(form)
      signIn({ id: data.id, email: data.email, username: data.username, avatarColor: data.avatarColor }, data.token)
      navigate('/')
    } catch { setError('Invalid email or password') }
    finally { setLoading(false) }
  }

  const loginAsDemo = async () => {
    setLoading(true); setError('')
    try {
      const { data } = await login({ email: DEMO_USER.email, password: DEMO_USER.password })
      signIn({ id: data.id, email: data.email, username: data.username, avatarColor: data.avatarColor }, data.token)
      navigate('/')
    } catch { setError('Demo account unavailable') }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-3 mb-10">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
            <MessageSquare size={20} className="text-slate-900" />
          </div>
          <span className="text-2xl font-semibold text-white">ChatApp</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
          <h1 className="text-xl font-semibold text-white mb-1">Welcome back</h1>
          <p className="text-sm text-slate-400 mb-6">Sign in to continue chatting</p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-lg mb-5">
              {error}
            </div>
          )}

          {/* Demo button */}
          <div className="mb-5">
            <p className="text-xs text-slate-500 mb-2">Quick access</p>
            <button onClick={loginAsDemo} disabled={loading}
              className="w-full flex items-center gap-3 px-4 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-emerald-500/40 rounded-xl transition-all text-left">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                style={{ backgroundColor: DEMO_USER.avatarColor }}>
                D
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-200">demo</p>
                <p className="text-xs text-slate-500">{DEMO_USER.email}</p>
              </div>
              <ArrowRight size={14} className="text-slate-500" />
            </button>
          </div>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-slate-800" />
            <span className="text-xs text-slate-600">or sign in manually</span>
            <div className="flex-1 h-px bg-slate-800" />
          </div>

          <form onSubmit={handle} className="space-y-4">
            {[
              { field: 'email', label: 'Email', icon: Mail, type: 'email', placeholder: 'you@example.com' },
              { field: 'password', label: 'Password', icon: Lock, type: 'password', placeholder: '••••••••' },
            ].map(({ field, label, icon: Icon, type, placeholder }) => (
              <div key={field}>
                <label className="text-xs font-medium text-slate-400 block mb-1.5">{label}</label>
                <div className="relative">
                  <Icon size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input type={type} value={form[field]} onChange={e => setForm({...form, [field]: e.target.value})}
                    placeholder={placeholder} required
                    className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-sm rounded-lg pl-10 pr-4 py-2.5 focus:border-emerald-500 transition-colors" />
                </div>
              </div>
            ))}
            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-900 font-semibold text-sm py-2.5 rounded-lg transition-colors mt-2">
              {loading ? 'Signing in...' : <><span>Sign in</span><ArrowRight size={15} /></>}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            No account? <Link to="/register" className="text-emerald-400 hover:text-emerald-300">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  )
}