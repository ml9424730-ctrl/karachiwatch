import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { createReport } from '../../api/api'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { 
  ReportIcon, 
  CameraIcon, 
  BotIcon, 
  MapIcon, 
  CheckCircleIcon,
  ShieldIcon,
  TruckIcon,
  AlertTriangleIcon,
  BoxIcon
} from '../../components/Icons'

import { KARACHI_LOCATIONS, DISTRICT_LIST } from '../../utils/karachiLocations'

const STEPS = ['Photo Upload', 'Verification', 'Location Details', 'Confirmation']

export default function ReportWaste() {
  const [step, setStep] = useState(0)
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [aiResult, setAiResult] = useState(null)
  const [annotated, setAnnotated] = useState(null)
  const [form, setForm] = useState({
    district: '',
    area: '',
    landmark: '',
    latitude: '',
    longitude: '',
    description: '',
  })
  const [availableAreas, setAvailableAreas] = useState([])
  const [loading, setLoading] = useState(false)
  const [gpsDetecting, setGpsDetecting] = useState(false)
  const [createdReport, setCreatedReport] = useState(null)
  const navigate = useNavigate()

  // Handle District Change -> Update available areas
  const handleDistrictChange = (selectedDistrict) => {
    const areas = KARACHI_LOCATIONS[selectedDistrict] || []
    setAvailableAreas(areas)
    const firstArea = areas[0]
    setForm(prev => ({
      ...prev,
      district: selectedDistrict,
      area: firstArea ? firstArea.name : '',
      latitude: firstArea ? String(firstArea.lat) : '',
      longitude: firstArea ? String(firstArea.lng) : '',
    }))
  }

  // Handle Area Change -> Auto-fill GPS Coordinates
  const handleAreaChange = (selectedAreaName) => {
    const matched = availableAreas.find(a => a.name === selectedAreaName)
    setForm(prev => ({
      ...prev,
      area: selectedAreaName,
      latitude: matched ? String(matched.lat) : prev.latitude,
      longitude: matched ? String(matched.lng) : prev.longitude,
    }))
  }

  // Auto-detect browser GPS coordinates
  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser')
      return
    }
    setGpsDetecting(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsDetecting(false)
        setForm(prev => ({
          ...prev,
          latitude: pos.coords.latitude.toFixed(6),
          longitude: pos.coords.longitude.toFixed(6),
        }))
        toast.success('Exact GPS coordinates detected')
      },
      (err) => {
        setGpsDetecting(false)
        toast.error(`Unable to retrieve GPS: ${err.message}`)
      },
      { timeout: 10000, enableHighAccuracy: true }
    )
  }

  const runScan = async (targetFile) => {
    if (!targetFile) return
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const fd = new FormData()
      fd.append('image', targetFile)
      const res = await fetch('/api/reports/scan', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.detail || 'Image scan failed')
      }
      setAiResult(data)
      if (data.annotated_image_b64) {
        setAnnotated(`data:image/jpeg;base64,${data.annotated_image_b64}`)
      }
      if (data.has_waste && data.total_detections > 0) {
        setStep(2)
        toast.success(`Waste verified: ${data.total_detections} item(s) detected`)
      } else {
        toast.warning(data.scan_note || 'No street garbage detected in this image')
      }
    } catch (err) {
      toast.error(err.message || 'Image scan failed. Please check network connection.')
    } finally {
      setLoading(false)
    }
  }

  const onDrop = useCallback((accepted) => {
    const f = accepted[0]
    if (!f) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
    setAnnotated(null)
    setAiResult(null)
    setStep(1)
    runScan(f)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    maxFiles: 1,
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file) {
      toast.error('Please upload an image first')
      return
    }
    if (!aiResult || !aiResult.has_waste || aiResult.total_detections === 0) {
      toast.error('Submission blocked: No uncollected waste detected in the photo')
      return
    }
    if (!form.district || !form.area) {
      toast.error('Please select both a District and an Area')
      return
    }

    setLoading(true)
    try {
      const fd = new FormData()
      fd.append('image', file)
      fd.append('district', form.district)
      fd.append('area', form.area)
      fd.append('latitude', form.latitude || '24.8607')
      fd.append('longitude', form.longitude || '67.0104')
      
      const combinedDescription = [
        form.landmark ? `Landmark: ${form.landmark}` : null,
        form.description ? `Details: ${form.description}` : null,
      ].filter(Boolean).join(' | ')

      fd.append('description', combinedDescription)

      const res = await createReport(fd)
      setCreatedReport(res.data)
      setStep(3)
      toast.success(`Report ${res.data.report_id} submitted successfully`)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Report submission failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>
          <ReportIcon size={24} color="var(--teal)" /> Report Waste Incident
        </h1>
        <p>Submit a municipal waste complaint with verified photo and precise location routing</p>
      </div>

      {/* STEP PROGRESS INDICATOR */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        maxWidth: 640,
        margin: '0 auto 28px',
        position: 'relative'
      }}>
        {STEPS.map((s, i) => (
          <div key={s} style={{ flex: 1, textAlign: 'center', position: 'relative' }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                margin: '0 auto 6px',
                background: i <= step ? 'var(--teal)' : 'var(--gray-200)',
                color: i <= step ? '#fff' : 'var(--gray-500)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.8rem',
                transition: 'background var(--duration)'
              }}
            >
              {i < step ? '✓' : i + 1}
            </div>
            <div
              style={{
                fontSize: '0.75rem',
                color: i === step ? 'var(--gray-900)' : 'var(--gray-500)',
                fontWeight: i === step ? 700 : 500,
              }}
            >
              {s}
            </div>
          </div>
        ))}
      </div>

      {step === 3 && createdReport ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px 24px', maxWidth: 600, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            <CheckCircleIcon size={52} color="var(--emerald)" />
          </div>
          <h2 style={{fontSize: '1.3rem', fontWeight: 800, color: 'var(--gray-900)', marginBottom: 8}}>
            Report Submitted Successfully
          </h2>
          <p style={{ color: 'var(--gray-500)', fontSize: '0.88rem', marginBottom: 20 }}>
            Report ID: <span className="report-id-pill">{createdReport.report_id}</span>
          </p>

          <div style={{
            margin: '0 auto 24px',
            padding: 16,
            background: 'var(--gray-50)',
            borderRadius: 'var(--radius)',
            border: '1px solid var(--gray-200)',
            textAlign: 'left',
            fontSize: '0.85rem'
          }}>
            <div style={{marginBottom: 6}}>
              <span style={{color: 'var(--gray-500)'}}>Location:</span> <strong>{createdReport.district}</strong> {createdReport.area ? `(${createdReport.area})` : ''}
            </div>
            <div style={{marginBottom: 6}}>
              <span style={{color: 'var(--gray-500)'}}>Verification:</span> <strong>Street Waste Detected</strong>
            </div>
            <div>
              <span style={{color: 'var(--gray-500)'}}>Current Status:</span> <span className="badge badge-pending">Pending Review</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={() => navigate('/citizen/my-reports')}>
              <ReportIcon size={16} /> View My Reports
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => {
                setStep(0)
                setFile(null)
                setPreview(null)
                setAiResult(null)
                setAnnotated(null)
                setForm({ district: '', area: '', landmark: '', latitude: '', longitude: '', description: '' })
              }}
            >
              Submit Another Report
            </button>
          </div>
        </div>
      ) : (
        <div className="grid-2">
          {/* LEFT: IMAGE UPLOAD & VERIFICATION */}
          <div className="card">
            <div className="card-title" style={{ marginBottom: 16 }}>
              <CameraIcon size={18} color="var(--teal)" /> 1. Upload Photo
            </div>
            {!preview ? (
              <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}>
                <input {...getInputProps()} />
                <div className="dropzone-icon" style={{ display: 'flex', justifyContent: 'center' }}>
                  <CameraIcon size={36} color="var(--gray-400)" />
                </div>
                <div className="dropzone-text">
                  Drag &amp; drop street waste photo or click to browse
                </div>
                <div className="dropzone-sub">
                  Photos are verified to ensure clear waste visibility before submission
                </div>
              </div>
            ) : (
              <>
                <div className="img-preview">
                  <img src={annotated || preview} alt="Detection Preview" />
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                  <div {...getRootProps()} style={{ cursor: 'pointer' }}>
                    <input {...getInputProps()} />
                    <button className="btn btn-secondary btn-sm" type="button">Change Photo</button>
                  </div>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => runScan(file)}
                    disabled={loading}
                  >
                    <BotIcon size={14} /> {loading ? 'Scanning...' : 'Re-verify'}
                  </button>
                </div>
              </>
            )}

            {/* AI DETECTION STATUS FEEDBACK */}
            {loading && (
              <div style={{ marginTop: 16, padding: 14, background: 'var(--gray-50)', borderRadius: 'var(--radius)', textAlign: 'center' }}>
                <div className="spinner" style={{ margin: '0 auto 8px', width: 20, height: 20, borderWidth: 2 }} />
                <div style={{ fontSize: '0.82rem', color: 'var(--gray-600)' }}>
                  Scanning image for street waste and debris...
                </div>
              </div>
            )}

            {aiResult && !loading && (
              <div style={{ marginTop: 16 }}>
                {aiResult.has_waste && aiResult.total_detections > 0 ? (
                  <div style={{ padding: 14, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 'var(--radius)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#166534', fontWeight: 700, marginBottom: 4, fontSize: '0.88rem' }}>
                      <CheckCircleIcon size={16} color="var(--emerald)" /> Verified Waste Detected
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#15803d', marginBottom: 10 }}>
                      {aiResult.scan_note}
                    </div>
                    <div className="grid-2" style={{ marginBottom: 8 }}>
                      <div className="stat-card" style={{ padding: '8px 12px', background: '#fff', borderTop: '2px solid var(--emerald)' }}>
                        <div className="stat-val" style={{ fontSize: '1.2rem', color: 'var(--emerald)' }}>{aiResult.total_detections}</div>
                        <div className="stat-label">Waste Items</div>
                      </div>
                      <div className="stat-card" style={{ padding: '8px 12px', background: '#fff', borderTop: '2px solid var(--amber)' }}>
                        <div className="stat-val" style={{ fontSize: '1.2rem', color: 'var(--amber)' }}>{aiResult.waste_coverage_pct}%</div>
                        <div className="stat-label">Coverage</div>
                      </div>
                    </div>

                    {/* AI Volume & Vehicle Advisory */}
                    {aiResult.volume_estimation && (
                      <div style={{ background: '#fff', padding: '8px 10px', borderRadius: 6, marginBottom: 8, fontSize: '0.78rem', border: '1px solid #e2e8f0' }}>
                        <div style={{ fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                          <TruckIcon size={14} color="var(--indigo)" />
                          Est. Volume: {aiResult.volume_estimation.estimated_volume_m3} m³ (~{aiResult.volume_estimation.estimated_tonnage} MT)
                        </div>
                        <div style={{ color: 'var(--gray-600)' }}>
                          Required Fleet: <strong>{aiResult.volume_estimation.dispatch_recommendation?.vehicle_type}</strong>
                        </div>
                      </div>
                    )}

                    {/* Bio-hazard / Hazard Alert */}
                    {aiResult.hazard_analysis?.is_hazardous && (
                      <div style={{ background: '#fff1f2', border: '1px solid #fecdd3', padding: '8px 10px', borderRadius: 6, marginBottom: 8, fontSize: '0.78rem' }}>
                        <div style={{ color: '#9f1239', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                          <AlertTriangleIcon size={14} color="#e11d48" />
                          {aiResult.hazard_analysis.hazard_level}: {aiResult.hazard_analysis.hazard_type}
                        </div>
                        <div style={{ color: '#be123c', fontSize: '0.74rem', marginTop: 2 }}>
                          {aiResult.hazard_analysis.priority_action}
                        </div>
                      </div>
                    )}

                    {/* Anti-Fraud Authenticity Badge */}
                    {aiResult.anti_fraud && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: '#166534', paddingTop: 4 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <ShieldIcon size={14} color="var(--emerald)" /> Anti-Fraud: {aiResult.anti_fraud.verdict_badge}
                        </span>
                        <span style={{ fontWeight: 700 }}>Score: {aiResult.anti_fraud.authenticity_score}%</span>
                      </div>
                    )}
                  </div>

                ) : (
                  <div style={{ padding: 14, background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 'var(--radius)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#9f1239', fontWeight: 700, marginBottom: 4, fontSize: '0.88rem' }}>
                      No Waste Detected
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#be123c', lineHeight: 1.5 }}>
                      The system could not identify uncollected street waste in this photo. Please upload a clearer image of garbage or litter heaps.
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* RIGHT: LOCATION & SUBMISSION */}
          <div className="card">
            <div className="card-title" style={{ marginBottom: 16 }}>
              <MapIcon size={18} color="var(--teal)" /> 2. District &amp; Location
            </div>
            <form onSubmit={handleSubmit}>
              {/* DISTRICT */}
              <div className="form-group">
                <label className="form-label">Karachi District *</label>
                <select
                  className="form-input form-select"
                  required
                  value={form.district}
                  onChange={e => handleDistrictChange(e.target.value)}
                >
                  <option value="">Select District</option>
                  {DISTRICT_LIST.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              {/* AREA */}
              <div className="form-group">
                <label className="form-label">Town / Area *</label>
                <select
                  className="form-input form-select"
                  required
                  disabled={!form.district || availableAreas.length === 0}
                  value={form.area}
                  onChange={e => handleAreaChange(e.target.value)}
                >
                  <option value="">
                    {!form.district ? 'First select a district' : 'Select Area / Town'}
                  </option>
                  {availableAreas.map(a => (
                    <option key={a.name} value={a.name}>{a.name}</option>
                  ))}
                </select>
              </div>

              {/* LANDMARK */}
              <div className="form-group">
                <label className="form-label">Street / Landmark <span style={{color:'var(--gray-400)',fontWeight:400}}>(optional)</span></label>
                <input
                  className="form-input"
                  placeholder="e.g. Near Market, Main Road, Block 4"
                  value={form.landmark}
                  onChange={e => setForm({ ...form, landmark: e.target.value })}
                />
              </div>

              {/* GPS BAR */}
              <div style={{
                padding: '10px 12px',
                background: 'var(--gray-50)',
                borderRadius: 'var(--radius)',
                marginBottom: 16,
                border: '1px solid var(--gray-200)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 8
              }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--gray-600)' }}>
                  Coordinates: <strong>{form.latitude && form.longitude ? `${form.latitude}, ${form.longitude}` : 'Auto-filled on area selection'}</strong>
                </div>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handleDetectGPS}
                  disabled={gpsDetecting}
                >
                  {gpsDetecting ? 'Detecting...' : 'Use My GPS'}
                </button>
              </div>

              {/* NOTES */}
              <div className="form-group">
                <label className="form-label">Additional Notes <span style={{color:'var(--gray-400)',fontWeight:400}}>(optional)</span></label>
                <textarea
                  className="form-input form-textarea"
                  placeholder="Details for the cleanup crew (e.g. overflowing bin, blocked drain)..."
                  rows={2}
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                />
              </div>

              {/* SUBMIT BUTTON */}
              {aiResult && (!aiResult.has_waste || aiResult.total_detections === 0) ? (
                <button
                  className="btn btn-full btn-lg"
                  type="button"
                  disabled
                  style={{
                    background: '#fecdd3',
                    color: '#9f1239',
                    cursor: 'not-allowed',
                    border: 'none',
                  }}
                >
                  Blocked &mdash; No Waste Detected in Photo
                </button>
              ) : (
                <button
                  className="btn btn-primary btn-full btn-lg"
                  type="submit"
                  disabled={!file || loading || !aiResult || !aiResult.has_waste || !form.district || !form.area}
                >
                  <ReportIcon size={18} /> {loading ? 'Submitting Report...' : 'Submit Verified Report'}
                </button>
              )}

              {(!aiResult || !file) && (
                <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)', textAlign: 'center', marginTop: 8 }}>
                  Upload a photo to verify waste before submitting
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
