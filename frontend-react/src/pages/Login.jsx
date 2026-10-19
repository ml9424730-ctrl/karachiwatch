import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login } from '../api/api'
import { useAuth } from '../contexts/AuthContext'
import { AppLogo, TrashIcon, ShieldIcon, KeyIcon, CheckCircleIcon } from '../components/Icons'
import './auth.css'

export default function Login() {
  const [form, setForm] = useState({ email_or_id: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { user, loginUser } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      if (user.role === 'admin') navigate('/admin/dashboard', { replace: true })
      else navigate('/citizen/dashboard', { replace: true })
    }
  }, [user, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      const res = await login(form)
      loginUser(res.data.access_token, res.data.user)
      navigate('/citizen/dashboard')
    } catch (err) {
      const detail = err.response?.data?.detail
      if (Array.isArray(detail)) {
        setError(detail.map(d => d.msg || JSON.stringify(d)).join(', '))
      } else if (typeof detail === 'object' && detail !== null) {
        setError(detail.msg || JSON.stringify(detail))
      } else {
        setError(detail || 'Login failed. Check your credentials.')
      }
    } finally { setLoading(false) }
  }

  return (
    <div className="auth-page">
      {/* Left Brand Panel */}
      <div className="auth-left">
        <div className="auth-brand" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <AppLogo size={34} variant="teal" />
          <div>
            <div className="auth-brand-name">WasteWatch AI</div>
            <span className="auth-brand-tag">Karachi Municipal Platform</span>
          </div>
        </div>
        <h2 className="auth-left-title">
          Civic waste<br />reporting, <span>reimagined.</span>
        </h2>
        <p className="auth-left-sub">
          Join thousands of citizens making Karachi cleaner
          through AI-verified waste reports.
        </p>
        <div className="auth-left-features">
          {[
            { icon: <TrashIcon size={15} color="#2dd4bf" />, bg: 'rgba(13,148,136,0.15)', text: 'AI-verified waste detection' },
            { icon: <CheckCircleIcon size={15} color="#10b981" />, bg: 'rgba(16,185,129,0.15)', text: 'Real-time status tracking' },
            { icon: <ShieldIcon size={15} color="#818cf8" />, bg: 'rgba(99,102,241,0.15)', text: 'Direct municipal routing' },
          ].map(f => (
            <div className="auth-left-feat" key={f.text}>
              <div className="auth-left-feat-icon" style={{background: f.bg}}>{f.icon}</div>
              {f.text}
            </div>
          ))}
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="auth-right">
        <div className="auth-form-box">
          <div className="auth-header">
            <div className="auth-logo-icon" style={{background: 'rgba(13,148,136,0.1)'}}>
              <TrashIcon size={24} color="var(--teal)" />
            </div>
            <h1 className="auth-title">Welcome back</h1>
            <p className="auth-subtitle">Sign in with your email or Citizen ID</p>
          </div>

          <div className="alert alert-info" style={{marginBottom: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8}}>
            <span><strong>Demo citizen:</strong> CIT-10001 / Citizen@Karachi2026</span>
            <button
              type="button"
              className="btn btn-secondary btn-xs"
              onClick={() => setForm({ email_or_id: 'CIT-10001', password: 'Citizen@Karachi2026' })}
              style={{fontSize: '0.72rem', padding: '3px 8px'}}
            >
              ⚡ Quick Fill
            </button>
          </div>

          {error && (
            <div className="alert alert-error">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email or Citizen ID</label>
              <input
                className="form-input"
                placeholder="e.g. CIT-10001 or email@example.com"
                value={form.email_or_id}
                onChange={e => setForm({...form, email_or_id: e.target.value})}
                required
                autoComplete="username"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                className="form-input"
                type="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={e => setForm({...form, password: e.target.value})}
                required
                autoComplete="current-password"
              />
            </div>
            <button
              className="btn btn-primary btn-full btn-lg"
              disabled={loading}
              style={{marginTop: 4}}
            >
              <KeyIcon size={17} />
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="auth-form-divider" />

          <div className="auth-footer-links">
            <span>No account? <Link to="/register">Register free</Link></span>
            <Link to="/admin-login" style={{display:'inline-flex',alignItems:'center',gap:5,color:'var(--indigo)',fontWeight:600,fontSize:'0.78rem'}}>
              <ShieldIcon size={13} /> Admin Portal
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
