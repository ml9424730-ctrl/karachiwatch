import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { AuthProvider, useAuth } from './contexts/AuthContext'

// Public
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import AdminLogin from './pages/AdminLogin'

// Citizen
import CitizenLayout from './layouts/CitizenLayout'
import CitizenDashboard from './pages/citizen/Dashboard'
import AIScanner from './pages/citizen/AIScanner'
import ReportWaste from './pages/citizen/ReportWaste'
import MyReports from './pages/citizen/MyReports'
import WasteMap from './pages/citizen/WasteMap'
import Profile from './pages/citizen/Profile'

// Admin
import AdminLayout from './layouts/AdminLayout'
import AdminDashboard from './pages/admin/Dashboard'
import AdminScanner from './pages/admin/AIScanner'
import AdminReports from './pages/admin/Reports'
import AdminMap from './pages/admin/WasteMap'
import Analytics from './pages/admin/Analytics'
import Hotspots from './pages/admin/Hotspots'
import CleanupVerification from './pages/admin/CleanupVerification'
import UserManagement from './pages/admin/UserManagement'

function ProtectedCitizen({ children }) {
  const { user } = useAuth()
  if (!user || user.role !== 'citizen') return <Navigate to="/login" replace />
  return children
}

function ProtectedAdmin({ children }) {
  const { user } = useAuth()
  if (!user || user.role !== 'admin') return <Navigate to="/admin-login" replace />
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin-login" element={<AdminLogin />} />

          {/* Citizen */}
          <Route path="/citizen" element={<ProtectedCitizen><CitizenLayout /></ProtectedCitizen>}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<CitizenDashboard />} />
            <Route path="scanner" element={<AIScanner />} />
            <Route path="report" element={<ReportWaste />} />
            <Route path="my-reports" element={<MyReports />} />
            <Route path="map" element={<WasteMap />} />
            <Route path="profile" element={<Profile />} />
            <Route path="assistant" element={<Navigate to="/citizen/dashboard" replace />} />
          </Route>

          {/* Admin */}
          <Route path="/admin" element={<ProtectedAdmin><AdminLayout /></ProtectedAdmin>}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="scanner" element={<AdminScanner />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="map" element={<AdminMap />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="hotspots" element={<Hotspots />} />
            <Route path="cleanup" element={<CleanupVerification />} />
            <Route path="users" element={<UserManagement />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <ToastContainer position="top-right" autoClose={3000} />
    </AuthProvider>
  )
}
