import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { adminLogin } from '../api/api'
import { useAuth } from '../contexts/AuthContext'
import { AppLogo, ShieldIcon, AnalyticsIcon, UsersIcon } from '../components/Icons'
import './auth.css'

export default function AdminLogin() {
  const [form, setForm] = useState({ email_or_id: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { user, loginUser } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user && user.role === 'admin') {
      navigate('/admin/dashboard', { replace: true })
    }
  }, [user, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      const res = await adminLogin(form)
      loginUser(res.data.access_token, res.data.user)
      navigate('/admin/dashboard')
    } catch (err) {
      const detail = err.response?.data?.detail
      if (Array.isArray(detail)) {
        setError(detail.map(d => d.msg || JSON.stringify(d)).join(', '))
      } else if (typeof detail === 'object' && detail !== null) {
        setError(detail.msg || JSON.stringify(detail))
      } else {
        setError(detail || 'Invalid Admin credentials.')
      }
    } finally { setLoading(false) }
  }

  return (
    <div className="auth-page">
      {/* Left Brand Panel */}
      <div className="auth-left auth-left-admin">
        <div className="auth-brand" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <AppLogo size={34} variant="indigo" />
          <div>
            <div className="auth-brand-name">WasteWatch Admin</div>
            <span className="auth-brand-tag">Municipal Operations Portal</span>
          </div>
        </div>
        <h2 className="auth-left-title">
          Municipal waste<br />management, <span>centralized.</span>
        </h2>
        <p className="auth-left-sub">
          Comprehensive dashboard to review reports, dispatch teams,
          track hotspots, and monitor citywide waste management operations.
        </p>
        <div className="auth-left-features">
          {[
            { icon: <ShieldIcon size={15} color="#818cf8" />, bg: 'rgba(99,102,241,0.15)', text: 'Review & verify citizen reports' },
            { icon: <AnalyticsIcon size={15} color="#f59e0b" />, bg: 'rgba(245,158,11,0.15)', text: 'District-level analytics & trends' },
            { icon: <UsersIcon size={15} color="#2dd4bf" />, bg: 'rgba(13,148,136,0.15)', text: 'User and team management' },
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
            <div className="auth-logo-icon" style={{background: 'rgba(79,70,229,0.1)'}}>
              <ShieldIcon size={24} color="var(--indigo)" />
            </div>
            <h1 className="auth-title">Admin Access</h1>
            <p className="auth-subtitle">Municipal Administration Portal — restricted access</p>
          </div>

          <div className="alert alert-info" style={{marginBottom: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 6}}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
              <span><strong>Demo credentials:</strong> ADMIN-001 / Admin@Karachi2026</span>
            </div>
            <button
              type="button"
              className="btn btn-secondary btn-xs"
              onClick={() => setForm({ email_or_id: 'ADMIN-001', password: 'Admin@Karachi2026' })}
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
              <label className="form-label">Admin ID or Email</label>
              <input
                className="form-input admin"
                placeholder="e.g. ADMIN-001"
                value={form.email_or_id}
                onChange={e => setForm({...form, email_or_id: e.target.value})}
                required
                autoComplete="username"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                className="form-input admin"
                type="password"
                placeholder="Enter admin password"
                value={form.password}
                onChange={e => setForm({...form, password: e.target.value})}
                required
                autoComplete="current-password"
              />
            </div>
            <button
              className="btn btn-admin btn-full btn-lg"
              disabled={loading}
              style={{marginTop: 4}}
            >
              <ShieldIcon size={17} />
              {loading ? 'Authenticating...' : 'Access Admin Portal'}
            </button>
          </form>

          <div className="auth-form-divider" />

          <div className="auth-footer-links auth-footer-link-admin">
            <Link to="/login">← Citizen Login</Link>
            <Link to="/">Home</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
