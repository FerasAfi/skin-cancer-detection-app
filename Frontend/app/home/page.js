'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { apiFetch, isLoggedIn } from '@/lib/auth';
import { useToast } from '@/components/Toast';

const DANGER_LABELS = ['melanoma', 'basal cell carcinoma', 'squamous cell carcinoma'];
const WARN_LABELS = ['actinic keratosis', 'dermatofibroma'];

function getRisk(label) {
  const l = label?.toLowerCase() || '';
  if (DANGER_LABELS.some(d => l.includes(d))) return 'danger';
  if (WARN_LABELS.some(w => l.includes(w))) return 'warn';
  return 'safe';
}

function getRiskColor(risk) {
  if (risk === 'danger') return 'var(--danger)';
  if (risk === 'warn') return 'var(--warn)';
  return 'var(--accent)';
}

export default function HomePage() {
  const router = useRouter();
  const toast = useToast();
  const [tab, setTab] = useState('upload');
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [drag, setDrag] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');

  useEffect(() => {
    if (!isLoggedIn()) { router.replace('/login'); }
    return () => { stopCamera(); };
  }, []);

  async function startCamera() {
    setCameraError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCameraActive(true);
    } catch (err) {
      setCameraError('Camera access denied. Please allow camera permission or use file upload.');
    }
  }

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  }

  function capturePhoto() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    canvas.toBlob(blob => {
      const f = new File([blob], 'capture.jpg', { type: 'image/jpeg' });
      setFile(f);
      setPreview(URL.createObjectURL(blob));
      setResult(null);
      stopCamera();
    }, 'image/jpeg', 0.92);
  }

  function handleTabChange(t) {
    setTab(t);
    if (t === 'camera') { startCamera(); }
    else { stopCamera(); }
    setPreview(null);
    setFile(null);
    setResult(null);
  }

  function handleFileChange(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResult(null);
  }

  function handleDrop(e) {
    e.preventDefault();
    setDrag(false);
    const f = e.dataTransfer.files?.[0];
    if (!f || !f.type.startsWith('image/')) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResult(null);
  }

  async function handlePredict() {
    if (!file) return;
    setLoading(true);
    setResult(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const data = await apiFetch('/ml/predict', { method: 'POST', body: fd });
      
      console.log('Full response:', data);
      setResult(data);
    } catch (err) {
      console.error('Prediction error:', err);
      toast(err.message || 'Prediction failed', 'error');
    } finally {
      setLoading(false);
    }
  }

  // FIXED: Extract from nested prediction object FIRST, then calculate risk
  const prediction = result?.prediction;
  const label = prediction?.label ?? 'Unknown';
  const confidence = prediction?.confidence ?? 0;
  const classId = prediction?.class_id;
  const jobId = result?.job_id;
  const imageUrl = result?.image_url;
  const latency = result?.latency_ms ?? 0;

  // NOW calculate risk based on the extracted label
  const risk = label !== 'Unknown' ? getRisk(label) : null;
  const riskColor = risk ? getRiskColor(risk) : null;

  return (
    <>
      <Navbar />
      <div className="page">
        <div className="container">
          <div style={{ maxWidth: 760, margin: '0 auto' }}>
            <div style={{ marginBottom: 32 }}>
              <h1 className="page-title">Skin Analysis</h1>
              <p className="page-subtitle">Upload or capture a photo of the lesion for instant AI-powered detection</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: preview && result ? '1fr 1fr' : '1fr', gap: 24 }}>
              <div>
                <div className="predict-tabs">
                  <button className={`predict-tab ${tab === 'upload' ? 'active' : ''}`} onClick={() => handleTabChange('upload')}>
                    📁 Upload Image
                  </button>
                  <button className={`predict-tab ${tab === 'camera' ? 'active' : ''}`} onClick={() => handleTabChange('camera')}>
                    📷 Camera
                  </button>
                </div>

                {tab === 'upload' && (
                  <>
                    {!preview ? (
                      <div
                        className={`upload-zone ${drag ? 'drag-over' : ''}`}
                        onDragOver={e => { e.preventDefault(); setDrag(true); }}
                        onDragLeave={() => setDrag(false)}
                        onDrop={handleDrop}
                      >
                        <input type="file" accept="image/*" onChange={handleFileChange} />
                        <div className="upload-icon">🖼️</div>
                        <div className="upload-text">Drop image here or click to browse</div>
                        <div className="upload-hint">JPG, PNG, WEBP — max 10MB</div>
                      </div>
                    ) : (
                      <>
                        <img src={preview} alt="Preview" className="preview-img" />
                        <div style={{ display: 'flex', gap: 10 }}>
                          <button className="btn btn-ghost btn-sm" onClick={() => { setPreview(null); setFile(null); setResult(null); }}>
                            ✕ Remove
                          </button>
                        </div>
                      </>
                    )}
                  </>
                )}

                {tab === 'camera' && (
                  <>
                    {cameraError && (
                      <div className="error-msg" style={{ marginBottom: 16 }}>{cameraError}</div>
                    )}
                    {!preview && (
                      <div className="camera-container">
                        <video ref={videoRef} autoPlay playsInline muted className="camera-video" />
                        <canvas ref={canvasRef} style={{ display: 'none' }} />
                        {cameraActive && (
                          <div className="camera-overlay">
                            <div className="camera-crosshair" />
                            <button className="capture-btn" onClick={capturePhoto}>
                              <div className="capture-btn-inner" />
                            </button>
                          </div>
                        )}
                        {!cameraActive && !cameraError && (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 240, background: 'var(--bg-elevated)' }}>
                            <button className="btn btn-primary" onClick={startCamera}>📷 Enable Camera</button>
                          </div>
                        )}
                      </div>
                    )}
                    {preview && (
                      <>
                        <img src={preview} alt="Captured" className="preview-img" />
                        <div style={{ display: 'flex', gap: 10 }}>
                          <button className="btn btn-ghost btn-sm" onClick={() => { setPreview(null); setFile(null); setResult(null); startCamera(); }}>
                            🔄 Retake
                          </button>
                        </div>
                      </>
                    )}
                  </>
                )}

                {file && (
                  <button
                    className="btn btn-primary btn-full"
                    style={{ marginTop: 16 }}
                    onClick={handlePredict}
                    disabled={loading}
                  >
                    {loading ? <><span className="spinner" /> Analyzing…</> : '🔍 Run Analysis'}
                  </button>
                )}
              </div>

              {/* Result display - NOW with working risk calculation */}
              {result && (
                <div>
                  <div className={`result-card result-${risk}`}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                      <span className={`badge ${risk === 'danger' ? 'badge-red' : risk === 'warn' ? 'badge-warn' : 'badge-green'}`}>
                        {risk === 'danger' ? '⚠ High Risk' : risk === 'warn' ? '⚡ Moderate Risk' : '✓ Low Risk'}
                      </span>
                    </div>

                    <div className="result-label-text" style={{ 
                      color: riskColor,
                      fontSize: '1.5rem',
                      fontWeight: 'bold',
                      marginBottom: '12px',
                      textAlign: 'center'
                    }}>
                      {label}
                    </div>
                    
                    <div className="result-score">
                      Confidence: <strong style={{ color: 'var(--text)' }}>{(confidence * 100).toFixed(1)}%</strong>
                    </div>

                    <div className="score-bar-bg">
                      <div
                        className="score-bar-fill"
                        style={{ width: `${confidence * 100}%`, background: riskColor }}
                      />
                    </div>

                    {risk === 'danger' && (
                      <div style={{
                        background: 'var(--danger-glow)',
                        border: '1px solid rgba(255,79,106,0.3)',
                        borderRadius: 10,
                        padding: '14px 16px',
                        fontSize: '0.875rem',
                        color: 'var(--danger)',
                        marginBottom: 16,
                        lineHeight: 1.6
                      }}>
                        ⚠️ <strong>Important:</strong> This result indicates a potentially high-risk lesion. Please consult a dermatologist as soon as possible for a professional evaluation.
                      </div>
                    )}

                    <div className="latency-tag">
                      ⚡ Job: {jobId?.slice(0, 8)}... | Confidence: {(confidence * 100).toFixed(1)}%
                    </div>
                  </div>

                  <div style={{ marginTop: 16 }}>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-faint)', lineHeight: 1.6 }}>
                      This is an AI-assisted tool for informational purposes only. It is not a substitute for professional medical diagnosis.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}