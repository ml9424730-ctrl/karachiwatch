import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  AppLogo,
  TrashIcon,
  SparklesIcon,
  CameraIcon,
  BotIcon,
  ShieldIcon,
  CheckCircleIcon,
  ReportIcon,
  KeyIcon,
  AnalyticsIcon,
  MapIcon,
  DashboardIcon,
  LogoutIcon
} from '../components/Icons'
import './Home.css'

const FEATURES = [
  {
    icon: <CameraIcon size={18} color="#2dd4bf" />,
    bg: 'rgba(13,148,136,0.15)',
    title: 'AI-Powered Detection',
    desc: 'YOLO computer vision identifies waste types, severity, and coverage area automatically.'
  },
  {
    icon: <MapIcon size={18} color="#818cf8" />,
    bg: 'rgba(99,102,241,0.15)',
    title: 'Real-Time Hotspot Map',
    desc: 'Live geospatial heatmap shows waste concentration across all Karachi districts.'
  },
  {
    icon: <AnalyticsIcon size={18} color="#f59e0b" />,
    bg: 'rgba(245,158,11,0.15)',
    title: 'Municipal Analytics',
    desc: 'District-level dashboards track resolution rates, trends, and team performance.'
  },
]

export default function Home() {
  const { user, logout } = useAuth()

  return (
    <div className="home">
      {/* ── NAVBAR ── */}
      <nav className="home-nav">
        <div className="nav-brand" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <AppLogo size={28} />
          <span>WasteWatch AI</span>
          <span className="nav-brand-dot" />
          <span style={{color:'var(--gray-400)',fontWeight:500,fontSize:'0.78rem',letterSpacing:'0.01em'}}>Karachi</span>
        </div>
        <div className="nav-links">
          <a href="#how" className="nav-link-text">How It Works</a>
          <a href="#about" className="nav-link-text">About</a>
          {user ? (
            <>
              {user.role === 'admin' ? (
                <Link to="/admin/dashboard" className="btn btn-admin btn-sm">
                  <ShieldIcon size={14} /> Admin Portal
                </Link>
              ) : (
                <Link to="/citizen/dashboard" className="btn btn-primary btn-sm">
                  <DashboardIcon size={14} /> My Dashboard
                </Link>
              )}
              <button
                type="button"
                onClick={logout}
                className="btn btn-secondary btn-sm"
                style={{display: 'inline-flex', alignItems: 'center', gap: 6}}
              >
                <LogoutIcon size={14} /> Sign Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary btn-sm">
                <KeyIcon size={14} /> Login
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                <ReportIcon size={14} /> Register
              </Link>
              <Link to="/admin-login" className="btn btn-admin btn-sm">
                <ShieldIcon size={14} /> Admin
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-eyebrow">
            <SparklesIcon size={13} />
            AI-Powered Civic Platform
          </div>
          <h1>
            Report Waste.<br />
            <span>Clean Karachi.</span>
          </h1>
          <p className="hero-sub">
            Pakistan's first AI-driven municipal waste management system.
            Citizens report, AI verifies, authorities dispatch.
          </p>
          <div className="hero-btns">
            {user ? (
              user.role === 'admin' ? (
                <>
                  <Link to="/admin/dashboard" className="btn btn-primary btn-lg">
                    <DashboardIcon size={17} /> Admin Dashboard
                  </Link>
                  <Link
                    to="/admin/reports"
                    className="btn btn-sm"
                    style={{
                      background: 'rgba(255,255,255,0.08)',
                      color: 'rgba(255,255,255,0.85)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      padding: '12px 20px',
                      fontSize: '0.9rem',
                      borderRadius: '14px'
                    }}
                  >
                    <ReportIcon size={16} /> Manage Reports
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/citizen/report" className="btn btn-primary btn-lg">
                    <ReportIcon size={17} /> Report Waste
                  </Link>
                  <Link
                    to="/citizen/dashboard"
                    className="btn btn-sm"
                    style={{
                      background: 'rgba(255,255,255,0.08)',
                      color: 'rgba(255,255,255,0.85)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      padding: '12px 20px',
                      fontSize: '0.9rem',
                      borderRadius: '14px'
                    }}
                  >
                    <DashboardIcon size={16} /> My Dashboard
                  </Link>
                </>
              )
            ) : (
              <>
                <Link to="/register" className="btn btn-primary btn-lg">
                  <ReportIcon size={17} /> Get Started
                </Link>
                <Link
                  to="/login"
                  className="btn btn-sm"
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    color: 'rgba(255,255,255,0.85)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    padding: '12px 20px',
                    fontSize: '0.9rem',
                    borderRadius: '14px'
                  }}
                >
                  <KeyIcon size={16} /> Sign In
                </Link>
              </>
            )}
          </div>
          <div className="hero-stats">
            <div className="hero-stat">
              <strong>2,400+</strong>
              <span>Reports Filed</span>
            </div>
            <div className="hero-stat">
              <strong>87%</strong>
              <span>Resolution Rate</span>
            </div>
            <div className="hero-stat">
              <strong>18</strong>
              <span>Hotspots Cleared</span>
            </div>
            <div className="hero-stat">
              <strong>6</strong>
              <span>Districts Covered</span>
            </div>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-icon-ring">
            <TrashIcon size={80} color="rgba(45,212,191,0.3)" />
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="how-section" id="how">
        <div style={{maxWidth: 640}}>
          <div className="section-label">
            <SparklesIcon size={12} /> Process
          </div>
          <h2 className="section-heading">How It Works</h2>
          <p className="section-sub">
            From citizen photo to municipal cleanup — in four steps, powered by AI.
          </p>
        </div>
        <div className="steps">
          {[
            {
              num: '01', icon: <CameraIcon size={22} color="var(--teal)" />,
              title: 'Upload Photo',
              desc: 'Take a photo of the waste location and upload it through the app.'
            },
            {
              num: '02', icon: <BotIcon size={22} color="var(--teal)" />,
              title: 'AI Verification',
              desc: 'YOLO AI scans the image and identifies waste types and coverage area.'
            },
            {
              num: '03', icon: <ShieldIcon size={22} color="var(--teal)" />,
              title: 'Admin Review',
              desc: 'Municipal admin reviews the verified report and assigns a sanitation team.'
            },
            {
              num: '04', icon: <CheckCircleIcon size={22} color="var(--teal)" />,
              title: 'Cleanup Verified',
              desc: 'After cleanup, an after-photo is submitted and AI confirms completion.'
            },
          ].map(s => (
            <div key={s.num} className="step-card">
              <div className="step-num">{s.num}</div>
              <div className="step-icon-wrap">
                {s.icon}
              </div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section className="about-section" id="about">
        <div className="about-grid">
          <div className="about-content">
            <div className="section-label" style={{color:'#2dd4bf'}}>
              <SparklesIcon size={12} /> About the Platform
            </div>
            <h2 className="section-heading">Built for Karachi's 15M+ Residents</h2>
            <p className="section-sub">
              WasteWatch AI bridges the gap between citizens and municipal authorities using
              real-time computer vision, geospatial mapping, and transparent reporting.
            </p>
            {FEATURES.map(f => (
              <div className="about-feature" key={f.title}>
                <div className="about-feature-icon" style={{background: f.bg}}>
                  {f.icon}
                </div>
                <div>
                  <h4>{f.title}</h4>
                  <p>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="about-stat-grid">
            {[
              {val:'2,400+', label:'Total Reports Submitted'},
              {val:'87%',    label:'Reports Resolved'},
              {val:'18',     label:'Hotspots Cleared'},
              {val:'<24h',   label:'Avg. Response Time'},
            ].map(s => (
              <div className="about-stat-card" key={s.label}>
                <div className="about-stat-val">{s.val}</div>
                <div className="about-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="home-footer">
        <div className="footer-brand">
          <TrashIcon size={16} color="rgba(255,255,255,0.4)" />
          WasteWatch AI — Karachi
        </div>
        <span>© 2026 — Built for a cleaner Karachi</span>
        <div style={{display:'flex',gap:12}}>
          <Link to="/login" style={{color:'rgba(255,255,255,0.35)',fontSize:'0.75rem'}}>Citizen Login</Link>
          <Link to="/admin-login" style={{color:'rgba(255,255,255,0.35)',fontSize:'0.75rem'}}>Admin Portal</Link>
        </div>
      </footer>
    </div>
  )
}
