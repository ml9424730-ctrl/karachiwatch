import { useEffect, useState } from 'react'
import { getReports, getReport, updateStatus, assignReport } from '../../api/api'
import StatusBadge from '../../components/StatusBadge'
import { toast } from 'react-toastify'
import { 
  ReportIcon, 
  SearchIcon, 
  UserIcon, 
  TruckIcon, 
  ClockIcon, 
  CheckCircleIcon,
  ShieldIcon,
  AlertTriangleIcon,
  BoxIcon
} from '../../components/Icons'


const STATUSES = ['Pending','Verified','In Progress','Resolved','Rejected']
const DISTRICTS = ['All','District South (Saddar, Clifton, DHA)','District East (Gulshan, Johar, PECHS)','District Central (Nazimabad, North Nazimabad)','District Korangi','District Keamari','District Malir','District West (Orangi, SITE)']

export default function AdminReports() {
  const [reports, setReports] = useState([])
  const [selected, setSelected] = useState(null)
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('All')
  const [filterDistrict, setFilterDistrict] = useState('All')
  const [newStatus, setNewStatus] = useState('')
  const [statusNote, setStatusNote] = useState('')
  const [assignTeam, setAssignTeam] = useState('')
  const [updating, setUpdating] = useState(false)

  const fetchReports = async () => {
    setLoading(true)
    const res = await getReports()
    setReports(res.data || [])
    setLoading(false)
  }

  useEffect(() => { fetchReports() }, [])

  const openReport = async (r) => {
    setSelected(r); setNewStatus(r.status); setStatusNote('')
    const res = await getReport(r.id)
    setDetail(res.data)
  }

  const handleStatusUpdate = async () => {
    if (!selected || !newStatus) return
    setUpdating(true)
    try {
      await updateStatus(selected.id, { status: newStatus, notes: statusNote })
      toast.success(`Status updated to ${newStatus}`)
      await fetchReports()
      if (selected) { const res = await getReport(selected.id); setDetail(res.data); setSelected({...selected, status: newStatus}) }
    } catch (err) { toast.error(err.response?.data?.detail || 'Update failed') }
    finally { setUpdating(false) }
  }

  const handleAssign = async () => {
    if (!assignTeam || !selected) return
    setUpdating(true)
    try {
      await assignReport(selected.id, { assigned_team: assignTeam, worker_notes: statusNote })
      toast.success('Team assigned — status set to In Progress')
      await fetchReports()
      if (selected) {
        const res = await getReport(selected.id)
        setDetail(res.data)
        setSelected({ ...selected, status: 'In Progress' })
      }
    } catch { toast.error('Assignment failed') }
    finally { setUpdating(false) }
  }

  const filtered = reports.filter(r => {
    const matchSearch = !search || r.report_id?.toLowerCase().includes(search.toLowerCase()) ||
      r.district?.toLowerCase().includes(search.toLowerCase()) ||
      r.citizen?.citizen_id?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'All' || r.status === filterStatus
    const matchDist = filterDistrict === 'All' || r.district === filterDistrict
    return matchSearch && matchStatus && matchDist
  })

  return (
    <div>
      {/* PAGE HEADER */}
      <div className="page-header">
        <h1 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <ReportIcon size={28} color="var(--indigo)" />
          Reports Management
        </h1>
        <p>Review, verify, and manage all citizen waste reports</p>
      </div>

      {/* FILTERS */}
      <div className="search-row">
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', flex: '1 1 280px', maxWidth: 340 }}>
          <input
            className="form-input"
            placeholder="Search by Report ID, District, Citizen ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: 36 }}
          />
          <div style={{ position: 'absolute', left: 12, display: 'flex', pointerEvents: 'none' }}>
            <SearchIcon size={16} color="var(--gray-400)" />
          </div>
        </div>

        <select
          className="form-input form-select"
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          style={{ maxWidth: 160 }}
        >
          <option value="All">All Statuses</option>
          {STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>

        <select
          className="form-input form-select"
          value={filterDistrict}
          onChange={e => setFilterDistrict(e.target.value)}
          style={{ maxWidth: 260 }}
        >
          {DISTRICTS.map(d => <option key={d}>{d}</option>)}
        </select>

        <span style={{ alignSelf: 'center', fontSize: '.85rem', color: 'var(--gray-400)', whiteSpace: 'nowrap' }}>
          {filtered.length} reports
        </span>
      </div>

      {/* SPLIT VIEW */}
      <div className="reports-split-view" style={{ display: 'grid', gap: 24 }}>

        {/* LEFT — REPORT LIST */}
        <div style={{ maxHeight: '75vh', overflowY: 'auto' }}>
          {loading ? (
            <div className="spinner" />
          ) : filtered.length === 0 ? (
            <div className="card">
              <div className="empty-state">
                <ReportIcon size={36} color="var(--gray-400)" />
                <p style={{ color: 'var(--gray-400)', marginTop: 10 }}>No reports match your filters</p>
              </div>
            </div>
          ) : (
            filtered.map(r => (
              <div
                key={r.id}
                className="card"
                style={{
                  marginBottom: 10,
                  cursor: 'pointer',
                  border: selected?.id === r.id
                    ? '1.5px solid var(--teal)'
                    : '1.5px solid transparent',
                  transition: 'border 0.15s ease, box-shadow 0.15s ease',
                }}
                onClick={() => openReport(r)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span className="report-id-pill">{r.report_id}</span>
                    <div style={{ fontWeight: 700, marginTop: 6, fontSize: '.9rem' }}>
                      {r.district}{r.area ? ` • ${r.area}` : ''}
                    </div>
                    <div style={{ marginTop: 4 }}>
                      <span className="id-pill">{r.citizen?.citizen_id || '—'}</span>
                    </div>
                    <div style={{ fontSize: '.78rem', color: 'var(--gray-400)', marginTop: 4 }}>
                      {new Date(r.created_at).toLocaleDateString()}
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
                      {r.estimated_volume_m3 > 0 && (
                        <span style={{ fontSize: '.72rem', background: '#e0e7ff', color: '#3730a3', padding: '2px 6px', borderRadius: 4, fontWeight: 600 }}>
                          📦 {r.estimated_volume_m3} m³
                        </span>
                      )}
                      {r.hazard_level && r.hazard_level !== 'SAFE / LOW' && r.hazard_level !== 'None' && (
                        <span style={{ fontSize: '.72rem', background: '#fee2e2', color: '#991b1b', padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>
                          ⚠️ {r.hazard_level}
                        </span>
                      )}
                      <span style={{ fontSize: '.72rem', background: '#f0fdf4', color: '#166534', padding: '2px 6px', borderRadius: 4, fontWeight: 600 }}>
                        🛡️ {r.authenticity_score ?? 100}%
                      </span>
                    </div>
                  </div>
                  <StatusBadge status={r.status} />
                </div>
              </div>

            ))
          )}
        </div>

        {/* RIGHT — DETAIL PANEL */}
        <div>
          {!selected ? (
            <div className="card">
              <div className="empty-state">
                <ReportIcon size={44} color="var(--gray-400)" />
                <p style={{ color: 'var(--gray-400)', marginTop: 12 }}>Select a report to view details</p>
              </div>
            </div>
          ) : (
            <div className="card">

              {/* Detail header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                <div>
                  <span className="report-id-pill">{selected.report_id}</span>
                  <div style={{ fontWeight: 700, fontSize: '1rem', marginTop: 6 }}>
                    {selected.district}{selected.area ? ` (${selected.area})` : ''}
                  </div>
                </div>
                <StatusBadge status={selected.status} />
              </div>

              {/* Citizen info */}
              {detail?.citizen && (
                <div style={{ background: '#f0f9ff', borderRadius: 10, padding: 14, marginBottom: 16 }}>
                  <div style={{ fontWeight: 700, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6, fontSize: '.88rem' }}>
                    <UserIcon size={16} color="var(--indigo)" />
                    Submitted By
                  </div>
                  <div style={{ fontSize: '.88rem', lineHeight: 1.7 }}>
                    <strong>{detail.citizen.full_name}</strong>
                    {' — '}
                    <span className="id-pill">{detail.citizen.citizen_id}</span>
                    <br />
                    {detail.citizen.email}
                    <br />
                    <span style={{ color: 'var(--gray-400)' }}>
                      Total complaints: {detail.citizen.complaint_count}
                    </span>
                  </div>
                </div>
              )}

              {/* Status update */}
              <div style={{ background: 'var(--gray-50)', borderRadius: 10, padding: 14, marginBottom: 16 }}>
                <div style={{ fontWeight: 700, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6, fontSize: '.88rem' }}>
                  <CheckCircleIcon size={16} color="var(--indigo)" />
                  Update Status
                </div>
                <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
                  {STATUSES.map(s => (
                    <button
                      key={s}
                      className="btn btn-xs"
                      onClick={() => setNewStatus(s)}
                      style={{
                        background: newStatus === s ? 'var(--teal)' : 'var(--gray-100)',
                        color: newStatus === s ? '#fff' : 'inherit',
                        transition: 'background 0.15s ease, color 0.15s ease',
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <textarea
                  className="form-input form-textarea"
                  placeholder="Add note (optional)..."
                  style={{ minHeight: 60 }}
                  value={statusNote}
                  onChange={e => setStatusNote(e.target.value)}
                />
                <button
                  className="btn btn-primary"
                  style={{ marginTop: 10 }}
                  onClick={handleStatusUpdate}
                  disabled={updating}
                >
                  {updating ? 'Updating...' : 'Apply Status'}
                </button>
              </div>

              {/* OPTION 4: AI VOLUME & FLEET ADVISOR */}
              {detail && (detail.estimated_volume_m3 > 0 || detail.recommended_vehicle) && (
                <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: 10, padding: 14, marginBottom: 16 }}>
                  <div style={{ fontWeight: 700, marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '.88rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#1e293b' }}>
                      <BoxIcon size={16} color="var(--indigo)" />
                      AI Volume &amp; Fleet Dispatch Advisor
                    </span>
                    <span style={{ fontSize: '.75rem', background: '#e0e7ff', color: '#3730a3', padding: '2px 8px', borderRadius: 10, fontWeight: 700 }}>
                      {detail.estimated_volume_m3} m³ (~{detail.estimated_tonnage} MT)
                    </span>
                  </div>
                  <div style={{ fontSize: '.82rem', color: '#334155', marginBottom: 8, lineHeight: 1.4 }}>
                    <strong>Recommended Fleet:</strong> {detail.recommended_vehicle || 'Standard Municipal Tipper'}
                  </div>
                  {detail.recommended_vehicle && (
                    <button
                      className="btn btn-secondary btn-xs"
                      onClick={() => setAssignTeam(detail.recommended_vehicle)}
                      style={{ fontSize: '.75rem' }}
                    >
                      ⚡ Auto-Fill Fleet Vehicle
                    </button>
                  )}
                </div>
              )}

              {/* OPTION 3: HAZARDOUS & BIO-MEDICAL ALERT */}
              {detail?.hazard_level && detail.hazard_level !== 'SAFE / LOW' && detail.hazard_level !== 'None' && (
                <div style={{ background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 10, padding: 14, marginBottom: 16 }}>
                  <div style={{ fontWeight: 700, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6, fontSize: '.88rem', color: '#9f1239' }}>
                    <AlertTriangleIcon size={16} color="#e11d48" />
                    EMERGENCY HAZMAT ALERT: {detail.hazard_level}
                  </div>
                  <div style={{ fontSize: '.82rem', color: '#881337', lineHeight: 1.4 }}>
                    <strong>Detected Threat:</strong> {detail.hazard_type || 'Potentially infectious or hazardous materials'}. Mandatory Kevlar/Nitrile PPE and specialized disposal protocol required.
                  </div>
                </div>
              )}

              {/* OPTION 7: ANTI-FRAUD INTEGRITY CARD */}
              {detail && (
                <div style={{ background: detail.authenticity_score >= 80 ? '#f0fdf4' : '#fffbeb', border: `1px solid ${detail.authenticity_score >= 80 ? '#bbf7d0' : '#fef3c7'}`, borderRadius: 10, padding: 12, marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '.82rem' }}>
                    <span style={{ fontWeight: 700, color: detail.authenticity_score >= 80 ? '#166534' : '#92400e', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <ShieldIcon size={14} color={detail.authenticity_score >= 80 ? '#16a34a' : '#d97706'} />
                      Anti-Fraud Integrity Shield
                    </span>
                    <span style={{ fontWeight: 700, color: detail.authenticity_score >= 80 ? '#166534' : '#b45309' }}>
                      {detail.authenticity_score}% {detail.fraud_status}
                    </span>
                  </div>
                  {detail.image_hash && (
                    <div style={{ fontSize: '.72rem', color: 'var(--gray-500)', marginTop: 4, fontFamily: 'monospace' }}>
                      Fingerprint: {detail.image_hash}
                    </div>
                  )}
                </div>
              )}

              {/* Assign team */}
              <div style={{ background: 'var(--gray-50)', borderRadius: 10, padding: 14, marginBottom: 16 }}>

                <div style={{ fontWeight: 700, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6, fontSize: '.88rem' }}>
                  <TruckIcon size={16} color="var(--indigo)" />
                  Assign Sanitation Team
                </div>
                <input
                  className="form-input"
                  placeholder="Team name..."
                  value={assignTeam}
                  onChange={e => setAssignTeam(e.target.value)}
                  style={{ marginBottom: 8 }}
                />
                <button
                  className="btn btn-amber"
                  onClick={handleAssign}
                  disabled={!assignTeam || updating}
                  style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}
                >
                  <TruckIcon size={16} />
                  Dispatch Team
                </button>
              </div>

              {/* Audit history */}
              {detail?.history?.length > 0 && (
                <div>
                  <div style={{ fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6, fontSize: '.88rem' }}>
                    <ClockIcon size={16} color="var(--indigo)" />
                    Audit History
                  </div>
                  <ul className="timeline">
                    {[...detail.history].reverse().map((h, i) => (
                      <li key={i} className="timeline-item">
                        <div className="timeline-dot">✓</div>
                        <div className="timeline-body">
                          <div className="timeline-title">
                            {h.from_status} → <strong>{h.to_status}</strong>
                          </div>
                          <div className="timeline-date">
                            {new Date(h.changed_at).toLocaleString()} by {h.changed_by}
                          </div>
                          {h.notes && <div className="timeline-note">{h.notes}</div>}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            </div>
          )}
        </div>
      </div>
    </div>
  )
}
