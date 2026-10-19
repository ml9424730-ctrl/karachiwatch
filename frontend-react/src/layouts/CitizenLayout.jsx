import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { 
  AppLogo,
  DashboardIcon, 
  ScannerIcon, 
  ReportIcon, 
  MapIcon, 
  UserIcon, 
  LogoutIcon
} from '../components/Icons'
import FloatingChatbot from '../components/FloatingChatbot'
import './layout.css'

const nav = [
  { to: 'dashboard',  icon: <DashboardIcon size={17} />, label: 'Dashboard' },
  { to: 'scanner',    icon: <ScannerIcon size={17} />,   label: 'AI Waste Scanner' },
  { to: 'report',     icon: <ReportIcon size={17} />,    label: 'Report Waste' },
  { to: 'my-reports', icon: <ReportIcon size={17} />,    label: 'My Reports' },
  { to: 'map',        icon: <MapIcon size={17} />,       label: 'Waste Map' },
  { to: 'profile',    icon: <UserIcon size={17} />,      label: 'Profile' },
]

export default function CitizenLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = () => { logout(); navigate('/') }
  const closeSidebar = () => setMobileOpen(false)

  return (
    <div className="layout">
      <header className="mobile-header">
        <button
          className="mobile-menu-btn"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle navigation"
        >
          {mobileOpen ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="3" y1="6"  x2="21" y2="6"  />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          )}
        </button>
        <div className="mobile-header-brand" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <AppLogo size={22} variant="teal" />
          <span>WasteWatch</span>
        </div>
        <div className="id-pill" style={{ fontSize: '0.65rem' }}>{user?.citizen_id || 'Citizen'}</div>
      </header>

      {mobileOpen && <div className="sidebar-backdrop" onClick={closeSidebar} />}

      <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-logo">
          <AppLogo size={32} variant="teal" />
          <div className="sidebar-logo-text">
            <span className="logo-name">WasteWatch</span>
            <span className="logo-portal">Citizen Portal</span>
          </div>
        </div>

        <div className="user-chip">
          <div className="user-avatar">
            <UserIcon size={16} color="rgba(255,255,255,0.7)" />
          </div>
          <div className="user-chip-info">
            <div className="user-name">{user?.full_name || 'Citizen'}</div>
            <div className="user-chip-id">
              <span className="id-pill" style={{ fontSize: '0.63rem' }}>{user?.citizen_id || ''}</span>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {nav.map(n => (
            <NavLink
              key={n.to}
              to={n.to}
              onClick={closeSidebar}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            >
              <span className="nav-item-icon">{n.icon}</span>
              {n.label}
            </NavLink>
          ))}
        </nav>

        <button className="logout-btn" onClick={handleLogout}>
          <span className="nav-item-icon"><LogoutIcon size={16} /></span>
          Sign Out
        </button>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>

      <FloatingChatbot />
    </div>
  )
}
