import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { register } from '../services/api'
import { MessageSquare, Mail, Lock, User, ArrowRight } from 'lucide-react'

export default function Register() {
  const [form, setForm] = useState({ email: '', password: '', username: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const handle = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const { data } = await register(form)
      signIn({ id: data.id, email: data.email, username: data.username, avatarColor: data.avatarColor }, data.token)
      navigate('/')
    } catch (err) { setError(err.response?.data?.message || 'Registration failed') }
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
          <h1 className="text-xl font-semibold text-white mb-1">Create account</h1>
          <p className="text-sm text-slate-400 mb-6">Join the conversation</p>
          {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-lg mb-5">{error}</div>}
          <form onSubmit={handle} className="space-y-4">
            {[
              { field: 'username', label: 'Username', icon: User, type: 'text', placeholder: 'John' },
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
              {loading ? 'Creating...' : <><span>Create account</span><ArrowRight size={15} /></>}
            </button>
          </form>
          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account? <Link to="/login" className="text-emerald-400 hover:text-emerald-300">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
