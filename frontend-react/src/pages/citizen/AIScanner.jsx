import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { toast } from 'react-toastify'
import { 
  ScannerIcon, 
  CameraIcon, 
  BotIcon, 
  SparklesIcon, 
  CheckCircleIcon, 
  AnalyticsIcon,
  ShieldIcon,
  TruckIcon,
  AlertTriangleIcon,
  BoxIcon
} from '../../components/Icons'

const API_BASE = '/api'

const SEV_COLORS = {
  'Low': '#10b981',
  'Medium': '#f59e0b',
  'High': '#f97316',
  'Critical': '#ef4444',
  'Clean / None': '#06b6d4',
}

export default function AIScanner() {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [result, setResult] = useState(null)
  const [annotated, setAnnotated] = useState(null)
  const [loading, setLoading] = useState(false)

  const onDrop = useCallback((accepted) => {
    const f = accepted[0]
    setFile(f)
    setPreview(URL.createObjectURL(f))
    setResult(null)
    setAnnotated(null)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: {'image/*':[]}, maxFiles:1 })

  const handleScan = async () => {
    if (!file) return
    setLoading(true)
    const fd = new FormData()
    fd.append('image', file)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API_BASE}/reports/scan`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.detail || 'Scan request failed')
      }
      setResult(data)
      if (data.annotated_image_b64) setAnnotated(`data:image/jpeg;base64,${data.annotated_image_b64}`)
      if (data.has_waste && data.total_detections > 0) {
        toast.success(`Analysis complete: ${data.total_detections} waste item(s) detected`)
      } else {
        toast.info(data.scan_note || 'Scan complete: No street garbage detected')
      }
    } catch (err) {
      toast.error(err.message || 'Scan request failed. Please check backend connection.')
    } finally { setLoading(false) }
  }

  const mlSev = result?.ml_severity
  const wasteClass = result?.waste_classification
  const imgQuality = result?.image_quality
  const hazardAnalysis = result?.hazard_analysis
  const volumeEst = result?.volume_estimation
  const antiFraud = result?.anti_fraud


  return (
    <div>
      <div className="page-header">
        <h1>
          <ScannerIcon size={24} color="var(--teal)" /> Waste Image Diagnostics &amp; Scanner
        </h1>
        <p>Object detection, priority classification, and recyclability analysis for civic waste inspection</p>
      </div>

      <div className="grid-2">
        {/* LEFT COLUMN: UPLOAD & PREVIEWS */}
        <div className="card">
          <div className="card-title" style={{marginBottom: 16}}>
            <CameraIcon size={18} color="var(--teal)" /> Select Waste Image
          </div>

          <div {...getRootProps()} className={`dropzone${isDragActive ? ' active' : ''}`}>
            <input {...getInputProps()} />
            <div className="dropzone-icon" style={{display: 'flex', justifyContent: 'center'}}>
              <CameraIcon size={36} color="var(--gray-400)" />
            </div>
            <div className="dropzone-text">
              {isDragActive ? 'Drop image here' : 'Drag & drop photo, or click to browse'}
            </div>
            <div className="dropzone-sub">Supports JPG, PNG, WEBP (Max 1 image)</div>
          </div>

          {preview && (
            <div className="img-preview" style={{marginTop: 16}}>
              <img src={annotated || preview} alt="Inspection Preview" />
            </div>
          )}

          <div style={{marginTop: 16}}>
            <button
              className="btn btn-primary btn-full btn-lg"
              onClick={handleScan}
              disabled={!file || loading}
            >
              {loading ? (
                <>
                  <div className="spinner" style={{width: 16, height: 16, borderWidth: 2, margin: 0}} />
                  Analyzing image...
                </>
              ) : (
                <>
                  <BotIcon size={18} /> Run Diagnostic Scan
                </>
              )}
            </button>
          </div>

          {/* IMAGE CLARITY CARD */}
          {imgQuality && (
            <div style={{
              marginTop: 16,
              padding: '12px 14px',
              background: 'var(--gray-50)',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--gray-200)'
            }}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6}}>
                <span style={{fontSize: '0.75rem', fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.04em'}}>
                  Image Clarity
                </span>
                <span className={`badge ${imgQuality.is_sharp ? 'badge-resolved' : 'badge-rejected'}`}>
                  {imgQuality.quality_grade} ({imgQuality.quality_score}/100)
                </span>
              </div>
              <div style={{fontSize: '0.8rem', color: 'var(--gray-600)'}}>
                {imgQuality.notes} &bull; Illumination: <strong>{imgQuality.brightness_level}</strong>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: DIAGNOSTIC RESULTS */}
        <div className="card">
          <div className="card-title" style={{marginBottom: 16}}>
            <BotIcon size={18} color="var(--teal)" /> Diagnostic Results
          </div>

          {!result && !loading && (
            <div className="empty-state">
              <BotIcon size={44} color="var(--gray-300)" />
              <p style={{fontWeight: 600, color: 'var(--gray-600)', marginBottom: 6}}>No image analyzed yet</p>
              <p style={{fontSize: '0.82rem', maxWidth: 320, margin: '0 auto', lineHeight: 1.5}}>
                Upload an image on the left and run diagnostics to detect waste items, compute coverage, and classify priority.
              </p>
            </div>
          )}

          {loading && (
            <div style={{textAlign: 'center', padding: '60px 0'}}>
              <div className="spinner" style={{margin: '0 auto 12px'}} />
              <p style={{color: 'var(--gray-600)', fontSize: '0.88rem', fontWeight: 500}}>
                Analyzing waste patterns and computing severity...
              </p>
            </div>
          )}

          {result && (
            <div>
              {/* PRIMARY STAT COUNTERS */}
              <div className="grid-2" style={{marginBottom: 16}}>
                <div className="stat-card" style={{borderTop: '3px solid var(--teal)'}}>
                  <div className="stat-val">{result.total_detections}</div>
                  <div className="stat-label">Items Detected</div>
                </div>
                <div className="stat-card" style={{borderTop: '3px solid var(--amber)'}}>
                  <div className="stat-val">{result.waste_coverage_pct}%</div>
                  <div className="stat-label">Waste Coverage</div>
                </div>
              </div>

              {!result.has_waste && (
                <div className="alert alert-info" style={{marginBottom: 16}}>
                  <div>
                    <div style={{fontWeight: 700, marginBottom: 2}}>Clean Area / No Waste Found</div>
                    <div style={{fontSize: '0.82rem'}}>
                      {result.scan_note || 'No uncollected garbage detected in this photo.'}
                    </div>
                  </div>
                </div>
              )}

              {/* MACHINE LEARNING SEVERITY CARD */}
              {mlSev && (
                <div style={{
                  padding: '14px 16px',
                  borderRadius: 'var(--radius)',
                  background: 'var(--gray-50)',
                  border: '1px solid var(--gray-200)',
                  marginBottom: 16
                }}>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 6}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: 6}}>
                      <AnalyticsIcon size={16} color="var(--indigo)" />
                      <span style={{fontWeight: 700, fontSize: '0.88rem', color: 'var(--gray-900)'}}>
                        Severity Assessment
                      </span>
                    </div>
                    <span style={{
                      background: SEV_COLORS[mlSev.predicted_severity] || 'var(--gray-600)',
                      color: '#fff',
                      padding: '3px 10px',
                      borderRadius: 14,
                      fontSize: '0.75rem',
                      fontWeight: 700
                    }}>
                      {mlSev.predicted_severity} (Score: {mlSev.severity_score})
                    </span>
                  </div>

                  <p style={{fontSize: '0.82rem', color: 'var(--gray-600)', marginBottom: 12, lineHeight: 1.5}}>
                    {mlSev.explanation}
                  </p>

                  {/* PROBABILITY DISTRIBUTION BARS */}
                  <div style={{fontSize: '0.72rem', fontWeight: 600, color: 'var(--gray-500)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em'}}>
                    Confidence Distribution
                  </div>
                  <div style={{display: 'flex', flexDirection: 'column', gap: 6}}>
                    {Object.entries(mlSev.confidence_probabilities || {}).map(([cName, prob]) => (
                      <div key={cName} style={{display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.78rem'}}>
                        <span style={{width: 50, fontWeight: 500, color: 'var(--gray-700)'}}>{cName}</span>
                        <div style={{flex: 1, height: 6, background: 'var(--gray-200)', borderRadius: 3, overflow: 'hidden'}}>
                          <div style={{
                            width: `${Math.round(prob * 100)}%`,
                            height: '100%',
                            background: SEV_COLORS[cName] || 'var(--teal)',
                            transition: 'width 0.3s ease'
                          }} />
                        </div>
                        <span style={{width: 36, textAlign: 'right', fontWeight: 600, color: 'var(--gray-500)'}}>
                          {(prob * 100).toFixed(0)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* RECYCLABILITY & MATERIAL STREAM */}
              {wasteClass && (
                <div style={{
                  padding: '14px 16px',
                  borderRadius: 'var(--radius)',
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  marginBottom: 16
                }}>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, flexWrap: 'wrap', gap: 6}}>
                    <span style={{fontWeight: 700, fontSize: '0.88rem', color: '#166534', display: 'flex', alignItems: 'center', gap: 6}}>
                      Dominant Stream: {wasteClass.dominant_material}
                    </span>
                    <span className="badge badge-resolved">
                      {wasteClass.recyclability_pct}% Recyclable
                    </span>
                  </div>

                  <div className="grid-2" style={{marginBottom: 8}}>
                    <div className="stat-card" style={{padding: '10px 12px', background: '#fff', borderTop: '2px solid var(--emerald)'}}>
                      <div style={{fontSize: '0.7rem', color: 'var(--gray-400)', fontWeight: 600}}>CARBON OFFSET</div>
                      <div style={{fontSize: '1.1rem', fontWeight: 800, color: '#166534'}}>~{wasteClass.carbon_offset_kg} kg CO₂e</div>
                    </div>
                    <div className="stat-card" style={{padding: '10px 12px', background: '#fff', borderTop: `2px solid ${wasteClass.hazard_level === 'High' ? 'var(--rose)' : 'var(--emerald)'}`}}>
                      <div style={{fontSize: '0.7rem', color: 'var(--gray-400)', fontWeight: 600}}>HAZARD RATING</div>
                      <div style={{fontSize: '1.1rem', fontWeight: 800, color: wasteClass.hazard_level === 'High' ? '#dc2626' : '#16a34a'}}>
                        {wasteClass.hazard_level}
                      </div>
                    </div>
                  </div>

                  <div style={{fontSize: '0.8rem', color: '#166534', lineHeight: 1.5}}>
                    <strong>Handling:</strong> {wasteClass.recommended_action}
                  </div>
                </div>
              )}

              {/* OPTION 3: HAZARDOUS & BIO-MEDICAL AI ASSESSMENT */}
              {hazardAnalysis && (
                <div style={{
                  padding: '14px 16px',
                  borderRadius: 'var(--radius)',
                  background: hazardAnalysis.is_hazardous ? '#fff1f2' : '#f8fafc',
                  border: `1px solid ${hazardAnalysis.is_hazardous ? '#fecdd3' : '#e2e8f0'}`,
                  marginBottom: 16
                }}>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 6}}>
                    <span style={{
                      fontWeight: 700, 
                      fontSize: '0.88rem', 
                      color: hazardAnalysis.is_hazardous ? '#9f1239' : '#334155',
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 6
                    }}>
                      <AlertTriangleIcon size={18} color={hazardAnalysis.is_hazardous ? '#e11d48' : '#64748b'} />
                      Hazard &amp; Bio-Medical Inspection
                    </span>
                    <span style={{
                      background: hazardAnalysis.hazard_level === 'CRITICAL HAZARD' ? '#e11d48' : hazardAnalysis.hazard_level === 'HIGH HAZARD' ? '#ea580c' : '#10b981',
                      color: '#fff',
                      padding: '3px 10px',
                      borderRadius: 14,
                      fontSize: '0.75rem',
                      fontWeight: 700
                    }}>
                      {hazardAnalysis.hazard_level}
                    </span>
                  </div>

                  {hazardAnalysis.is_hazardous ? (
                    <div>
                      <div style={{fontSize: '0.82rem', color: '#9f1239', fontWeight: 600, marginBottom: 6}}>
                        {hazardAnalysis.priority_action}
                      </div>
                      <div style={{fontSize: '0.78rem', color: '#881337', marginBottom: 8, lineHeight: 1.4}}>
                        <strong>Containment:</strong> {hazardAnalysis.safety_protocol?.containment_instructions}
                      </div>
                      <div style={{display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6}}>
                        {hazardAnalysis.safety_protocol?.ppe_required?.map((ppe, i) => (
                          <span key={i} style={{fontSize: '0.72rem', background: '#ffe4e6', color: '#9f1239', padding: '2px 8px', borderRadius: 6, fontWeight: 600}}>
                            🛡️ {ppe}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div style={{fontSize: '0.8rem', color: '#64748b'}}>
                      Clean scan: No bio-medical sharps, hazardous chemicals, or decaying animal offal detected.
                    </div>
                  )}
                </div>
              )}

              {/* OPTION 4: DUMP VOLUME & TONNAGE ESTIMATION AI */}
              {volumeEst && volumeEst.estimated_volume_m3 > 0 && (
                <div style={{
                  padding: '14px 16px',
                  borderRadius: 'var(--radius)',
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  marginBottom: 16
                }}>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, flexWrap: 'wrap', gap: 6}}>
                    <span style={{fontWeight: 700, fontSize: '0.88rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: 6}}>
                      <BoxIcon size={18} color="var(--indigo)" />
                      Volume &amp; Fleet Tonnage Estimator
                    </span>
                    <span style={{background: '#e0e7ff', color: '#3730a3', padding: '3px 10px', borderRadius: 14, fontSize: '0.75rem', fontWeight: 700}}>
                      {volumeEst.volume_category}
                    </span>
                  </div>

                  <div className="grid-2" style={{marginBottom: 10}}>
                    <div className="stat-card" style={{padding: '10px 12px', background: '#fff', borderTop: '2px solid var(--indigo)'}}>
                      <div style={{fontSize: '0.7rem', color: 'var(--gray-400)', fontWeight: 600}}>ESTIMATED PILE VOLUME</div>
                      <div style={{fontSize: '1.2rem', fontWeight: 800, color: 'var(--indigo)'}}>
                        {volumeEst.estimated_volume_m3} m³
                      </div>
                      <div style={{fontSize: '0.72rem', color: 'var(--gray-500)'}}>
                        Footprint: ~{volumeEst.pile_dimensions?.ground_footprint_m2} m²
                      </div>
                    </div>
                    <div className="stat-card" style={{padding: '10px 12px', background: '#fff', borderTop: '2px solid var(--teal)'}}>
                      <div style={{fontSize: '0.7rem', color: 'var(--gray-400)', fontWeight: 600}}>ESTIMATED MASS</div>
                      <div style={{fontSize: '1.2rem', fontWeight: 800, color: 'var(--teal)'}}>
                        {volumeEst.estimated_tonnage} MT
                      </div>
                      <div style={{fontSize: '0.72rem', color: 'var(--gray-500)'}}>
                        ~{volumeEst.estimated_weight_kg} kg refuse
                      </div>
                    </div>
                  </div>

                  <div style={{background: '#fff', padding: '10px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: '0.8rem', lineHeight: 1.5}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, color: '#0f172a', marginBottom: 2}}>
                      <TruckIcon size={16} color="var(--indigo)" />
                      Recommended Dispatch: {volumeEst.dispatch_recommendation?.vehicle_type}
                    </div>
                    <div style={{color: 'var(--gray-600)', fontSize: '0.78rem'}}>
                      Crew: <strong>{volumeEst.dispatch_recommendation?.crew_size}</strong> &bull; Est. Duration: <strong>{volumeEst.dispatch_recommendation?.estimated_time}</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* OPTION 7: ANTI-FRAUD & AUTHENTICITY SHIELD */}
              {antiFraud && (
                <div style={{
                  padding: '12px 14px',
                  borderRadius: 'var(--radius)',
                  background: antiFraud.authenticity_score >= 80 ? '#f0fdf4' : '#fffbeb',
                  border: `1px solid ${antiFraud.authenticity_score >= 80 ? '#bbf7d0' : '#fef3c7'}`,
                  marginBottom: 16
                }}>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6}}>
                    <span style={{
                      fontWeight: 700, 
                      fontSize: '0.84rem', 
                      color: antiFraud.authenticity_score >= 80 ? '#166534' : '#92400e',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6
                    }}>
                      <ShieldIcon size={16} color={antiFraud.authenticity_score >= 80 ? '#16a34a' : '#d97706'} />
                      Anti-Fraud Integrity Shield
                    </span>
                    <span style={{
                      background: antiFraud.authenticity_score >= 80 ? '#16a34a' : '#d97706',
                      color: '#fff',
                      padding: '2px 8px',
                      borderRadius: 12,
                      fontSize: '0.72rem',
                      fontWeight: 700
                    }}>
                      {antiFraud.authenticity_score}% {antiFraud.verdict_badge}
                    </span>
                  </div>
                  <div style={{fontSize: '0.78rem', color: antiFraud.authenticity_score >= 80 ? '#15803d' : '#b45309'}}>
                    {antiFraud.explanation}
                  </div>
                </div>
              )}


              {/* DETECTIONS BREAKDOWN TABLE */}
              {result.detections?.length > 0 && (
                <div>
                  <div style={{fontSize: '0.8rem', fontWeight: 700, color: 'var(--gray-700)', marginBottom: 8}}>
                    Detected Items Breakdown ({result.detections.length})
                  </div>
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Class</th>
                          <th>Confidence</th>
                          <th>Area Ratio</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.detections.map((d, i) => (
                          <tr key={i}>
                            <td>{i + 1}</td>
                            <td><strong>{d.class_name}</strong></td>
                            <td>{(d.confidence * 100).toFixed(1)}%</td>
                            <td>{((d.area_ratio || 0) * 100).toFixed(1)}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
