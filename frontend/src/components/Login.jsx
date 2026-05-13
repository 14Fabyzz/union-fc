import { useState } from 'react'
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck } from 'lucide-react'

const PARTICLES = [
  { id:0,  size:2.5, x:8,  y:15, dur:12, delay:0   },
  { id:1,  size:1.5, x:22, y:72, dur:9,  delay:1.5 },
  { id:2,  size:3,   x:38, y:30, dur:14, delay:0.5 },
  { id:3,  size:1,   x:55, y:85, dur:10, delay:2   },
  { id:4,  size:2,   x:70, y:20, dur:11, delay:3   },
  { id:5,  size:1.5, x:83, y:60, dur:13, delay:0.8 },
  { id:6,  size:2.5, x:92, y:40, dur:8,  delay:1   },
  { id:7,  size:1,   x:15, y:50, dur:15, delay:4   },
  { id:8,  size:2,   x:45, y:10, dur:10, delay:2.5 },
  { id:9,  size:1.5, x:60, y:70, dur:12, delay:1.2 },
  { id:10, size:3,   x:78, y:88, dur:9,  delay:0.3 },
  { id:11, size:1,   x:30, y:95, dur:16, delay:3.5 },
  { id:12, size:2,   x:5,  y:80, dur:11, delay:2   },
  { id:13, size:1.5, x:95, y:12, dur:13, delay:1.8 },
  { id:14, size:2.5, x:50, y:45, dur:10, delay:0   },
]

const STATS = [
  { value: '2024', label: 'Fundación' },
  { value: '100+', label: 'Jugadores' },
  { value: '#1',   label: 'Categoría'  },
]

export default function Login({ onLogin }) {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPwd,  setShowPwd]  = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const base = (import.meta.env.VITE_API_URL ?? '') + '/api'
      const res = await fetch(`${base}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      if (res.ok) {
        const { token } = await res.json()
        onLogin(token, email)
      } else {
        setError('Credenciales incorrectas. Verificá tu usuario y contraseña.')
      }
    } catch {
      setError('Error de conexión. Verificá que el servidor esté activo.')
    } finally {
      setLoading(false)
    }
  }

  const focusIn = e => {
    e.target.style.borderColor = 'rgba(192,57,43,0.7)'
    e.target.style.background  = 'rgba(192,57,43,0.06)'
    e.target.style.boxShadow   = '0 0 0 3px rgba(192,57,43,0.12)'
  }
  const focusOut = e => {
    e.target.style.borderColor = 'rgba(255,255,255,0.08)'
    e.target.style.background  = 'rgba(255,255,255,0.04)'
    e.target.style.boxShadow   = 'none'
  }

  const inputStyle = {
    width: '100%',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 12,
    color: 'white',
    fontSize: '0.9rem',
    outline: 'none',
    transition: 'border-color 0.2s, background 0.2s, box-shadow 0.2s',
    fontFamily: "'DM Sans', sans-serif",
  }

  return (
    <div
      className="flex h-screen w-screen overflow-hidden"
      style={{ background: '#02061a', fontFamily: "'DM Sans', sans-serif" }}
    >

      {/* ════════════════════════════════════════
          RIGHT PANEL — Visual (solo desktop, ahora a la derecha)
      ════════════════════════════════════════ */}
      <div
        className="hidden lg:flex lg:flex-col lg:flex-1"
        style={{
          position: 'relative', overflow: 'hidden',
          background: 'linear-gradient(145deg, #020818 0%, #0a1540 45%, #0e1d5c 100%)',
          order: 2,
        }}
      >
        {/* Spotlight glow */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse 90% 70% at 50% 25%, rgba(22,36,128,0.6) 0%, transparent 70%)',
        }} />

        {/* Ember rojo inferior */}
        <div style={{
          position: 'absolute', bottom: -80, left: '50%', transform: 'translateX(-50%)',
          width: 700, height: 320, pointerEvents: 'none',
          background: 'radial-gradient(ellipse, rgba(192,57,43,0.18) 0%, transparent 65%)',
        }} />

        {/* Rayo diagonal */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'linear-gradient(120deg, transparent 40%, rgba(255,255,255,0.025) 50%, transparent 60%)',
          animation: 'light-beam 6s ease-in-out infinite',
        }} />

        {/* Partículas */}
        {PARTICLES.map(p => (
          <div key={p.id} style={{
            position: 'absolute',
            left: `${p.x}%`, top: `${p.y}%`,
            width: p.size, height: p.size,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.5)',
            animation: `particle-float ${p.dur}s ${p.delay}s ease-in-out infinite alternate`,
          }} />
        ))}

        {/* Campo de fútbol SVG */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.12,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg viewBox="0 0 420 280" style={{ width: '82%', maxWidth: 480 }}>
            <rect x="12" y="12" width="396" height="256" rx="2"
              fill="none" stroke="white" strokeWidth="2"
              strokeDasharray="1320" strokeDashoffset="1320"
              style={{ animation: 'draw-line 2.6s ease forwards 0.2s' }}
            />
            <line x1="210" y1="12" x2="210" y2="268"
              stroke="white" strokeWidth="2"
              strokeDasharray="256" strokeDashoffset="256"
              style={{ animation: 'draw-line 1s ease forwards 1.1s' }}
            />
            <circle cx="210" cy="140" r="46"
              fill="none" stroke="white" strokeWidth="2"
              strokeDasharray="289" strokeDashoffset="289"
              style={{ animation: 'draw-line 1.4s ease forwards 1.3s' }}
            />
            <circle cx="210" cy="140" r="3.5" fill="white"
              style={{ opacity: 0, animation: 'fade-in 0.3s ease forwards 2.3s' }}
            />
            <rect x="12" y="80" width="68" height="120" rx="1"
              fill="none" stroke="white" strokeWidth="2"
              strokeDasharray="376" strokeDashoffset="376"
              style={{ animation: 'draw-line 1s ease forwards 0.9s' }}
            />
            <rect x="340" y="80" width="68" height="120" rx="1"
              fill="none" stroke="white" strokeWidth="2"
              strokeDasharray="376" strokeDashoffset="376"
              style={{ animation: 'draw-line 1s ease forwards 0.9s' }}
            />
            <rect x="12" y="106" width="30" height="68" rx="1"
              fill="none" stroke="white" strokeWidth="2"
              strokeDasharray="196" strokeDashoffset="196"
              style={{ animation: 'draw-line 0.7s ease forwards 1.6s' }}
            />
            <rect x="378" y="106" width="30" height="68" rx="1"
              fill="none" stroke="white" strokeWidth="2"
              strokeDasharray="196" strokeDashoffset="196"
              style={{ animation: 'draw-line 0.7s ease forwards 1.6s' }}
            />
            <circle cx="68" cy="140" r="2.5" fill="white"
              style={{ opacity: 0, animation: 'fade-in 0.3s ease forwards 2s' }}
            />
            <circle cx="352" cy="140" r="2.5" fill="white"
              style={{ opacity: 0, animation: 'fade-in 0.3s ease forwards 2s' }}
            />
            <path d="M 80 110 A 38 38 0 0 1 80 170"
              fill="none" stroke="white" strokeWidth="2"
              strokeDasharray="62" strokeDashoffset="62"
              style={{ animation: 'draw-line 0.6s ease forwards 2.1s' }}
            />
            <path d="M 340 110 A 38 38 0 0 0 340 170"
              fill="none" stroke="white" strokeWidth="2"
              strokeDasharray="62" strokeDashoffset="62"
              style={{ animation: 'draw-line 0.6s ease forwards 2.1s' }}
            />
            <rect x="0" y="118" width="12" height="44"
              fill="none" stroke="white" strokeWidth="2"
              strokeDasharray="112" strokeDashoffset="112"
              style={{ animation: 'draw-line 0.5s ease forwards 2.4s' }}
            />
            <rect x="408" y="118" width="12" height="44"
              fill="none" stroke="white" strokeWidth="2"
              strokeDasharray="112" strokeDashoffset="112"
              style={{ animation: 'draw-line 0.5s ease forwards 2.4s' }}
            />
          </svg>
        </div>

        {/* Contenido central */}
        <div style={{
          position: 'relative', zIndex: 10, flex: 1,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          textAlign: 'center', padding: '0 48px',
        }}>
          {/* Logo con anillos */}
          <div style={{ animation: 'logo-in 0.9s cubic-bezier(0.34,1.56,0.64,1) forwards 0.5s', opacity: 0 }}>
            <div style={{ position: 'relative', width: 128, height: 128, margin: '0 auto' }}>
              <div style={{
                position: 'absolute', inset: -20, borderRadius: '50%',
                border: '1px solid rgba(192,57,43,0.18)',
                animation: 'ring-pulse 3s ease-in-out infinite 0.8s',
              }} />
              <div style={{
                position: 'absolute', inset: -10, borderRadius: '50%',
                border: '1px solid rgba(192,57,43,0.32)',
                animation: 'ring-pulse 3s ease-in-out infinite 0.3s',
              }} />
              <div style={{
                width: '100%', height: '100%', borderRadius: '50%',
                background: 'radial-gradient(circle at 40% 35%, rgba(22,36,128,0.9), rgba(2,6,26,0.95))',
                border: '2px solid rgba(255,255,255,0.14)',
                boxShadow: '0 0 50px rgba(192,57,43,0.35), 0 0 100px rgba(14,29,92,0.4), inset 0 1px 0 rgba(255,255,255,0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <img src="/logo.png" alt="Unión FC"
                  style={{ width: 88, height: 88, borderRadius: '50%', objectFit: 'cover' }}
                  onError={e => { e.target.style.display = 'none' }}
                />
              </div>
            </div>
          </div>

          {/* Nombre del club */}
          <div style={{ animation: 'slide-up 0.8s ease forwards 1s', opacity: 0, marginTop: 36 }}>
            <p style={{
              fontSize: '0.68rem', letterSpacing: '0.45em',
              color: 'rgba(192,57,43,0.8)', textTransform: 'uppercase',
              fontWeight: 600, marginBottom: 6,
            }}>
              Escuela de Fútbol
            </p>
            <h1 style={{
              fontFamily: "'Bebas Neue', cursive",
              fontSize: 'clamp(3.5rem, 5.5vw, 5.5rem)',
              letterSpacing: '0.18em', color: 'white',
              lineHeight: 0.95,
              textShadow: '0 2px 40px rgba(14,29,92,0.6)',
            }}>
              UNIÓN FC
            </h1>
            <div style={{
              height: 2,
              background: 'linear-gradient(90deg, transparent, #c0392b 30%, #e74c3c 50%, #c0392b 70%, transparent)',
              margin: '14px auto 0', width: '55%',
              animation: 'expand-line 0.9s cubic-bezier(0.16,1,0.3,1) forwards 1.6s',
              transform: 'scaleX(0)', transformOrigin: 'center',
            }} />
            <p style={{
              fontSize: '0.68rem', letterSpacing: '0.4em',
              color: 'rgba(255,255,255,0.3)',
              textTransform: 'uppercase', marginTop: 12,
            }}>
              Disciplina · Compromiso · Victoria
            </p>
          </div>

          {/* Stats */}
          <div style={{
            animation: 'slide-up 0.8s ease forwards 1.4s', opacity: 0,
            marginTop: 52, display: 'flex', gap: 48,
          }}>
            {STATS.map(({ value, label }) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{
                  fontFamily: "'Bebas Neue', cursive",
                  fontSize: '2rem', color: '#c0392b', lineHeight: 1,
                }}>{value}</div>
                <div style={{
                  fontSize: '0.6rem', letterSpacing: '0.22em',
                  color: 'rgba(255,255,255,0.28)',
                  textTransform: 'uppercase', marginTop: 5,
                }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Viñeta inferior */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 160,
          background: 'linear-gradient(transparent, rgba(2,6,26,0.6))',
          pointerEvents: 'none',
        }} />
      </div>

      {/* Divisor vertical (solo desktop) */}
      <div
        className="hidden lg:block"
        style={{
          width: 1, flexShrink: 0, order: 1,
          background: 'linear-gradient(to bottom, transparent 5%, rgba(255,255,255,0.07) 25%, rgba(255,255,255,0.07) 75%, transparent 95%)',
        }}
      />

      {/* ════════════════════════════════════════
          LEFT PANEL — Formulario (full en móvil, izquierda en desktop)
      ════════════════════════════════════════ */}
      <div
        className="flex flex-col items-center justify-center flex-1 lg:flex-none lg:w-[460px]"
        style={{
          padding: '32px 24px',
          background: 'linear-gradient(160deg, #040921 0%, #070e2e 60%, #050b1f 100%)',
          position: 'relative', overflow: 'hidden',
          order: 0,
        }}
      >

        {/* Glow esquinas */}
        <div style={{
          position: 'absolute', top: -80, left: -80,
          width: 300, height: 300, borderRadius: '50%', pointerEvents: 'none',
          background: 'radial-gradient(circle, rgba(192,57,43,0.07) 0%, transparent 70%)',
        }} />
        <div style={{
          position: 'absolute', bottom: -100, right: -60,
          width: 280, height: 280, borderRadius: '50%', pointerEvents: 'none',
          background: 'radial-gradient(circle, rgba(14,29,92,0.25) 0%, transparent 70%)',
        }} />

        {/* ── Header móvil: logo + nombre (oculto en desktop) ── */}
        <div
          className="flex flex-col items-center mb-8 lg:hidden"
          style={{ animation: 'slide-up 0.6s ease forwards', opacity: 0 }}
        >
          <div style={{ position: 'relative', width: 80, height: 80, marginBottom: 14 }}>
            <div style={{
              position: 'absolute', inset: -7, borderRadius: '50%',
              border: '1px solid rgba(192,57,43,0.35)',
              animation: 'ring-pulse 2.5s ease-in-out infinite',
            }} />
            <div style={{
              width: '100%', height: '100%', borderRadius: '50%',
              background: 'radial-gradient(circle at 40% 35%, rgba(22,36,128,0.9), rgba(2,6,26,0.95))',
              border: '2px solid rgba(255,255,255,0.12)',
              boxShadow: '0 0 30px rgba(192,57,43,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <img src="/logo.png" alt="Unión FC"
                style={{ width: 60, height: 60, borderRadius: '50%', objectFit: 'cover' }}
                onError={e => { e.target.style.display = 'none' }}
              />
            </div>
          </div>
          <p style={{
            fontSize: '0.6rem', letterSpacing: '0.4em',
            color: 'rgba(192,57,43,0.8)', textTransform: 'uppercase',
            fontWeight: 600, marginBottom: 2,
          }}>Escuela de Fútbol</p>
          <h1 style={{
            fontFamily: "'Bebas Neue', cursive",
            fontSize: '2.2rem', letterSpacing: '0.18em', color: 'white', lineHeight: 1,
          }}>UNIÓN FC</h1>
          <div style={{
            height: 1,
            background: 'linear-gradient(90deg, transparent, #c0392b, transparent)',
            width: 120, marginTop: 10,
          }} />
        </div>

        {/* ── Formulario real ── */}
        <div style={{ width: '100%', maxWidth: 360, position: 'relative', zIndex: 1 }}>

          {/* Encabezado */}
          <div style={{ animation: 'slide-up 0.7s ease forwards 0.25s', opacity: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <ShieldCheck style={{ width: 14, height: 14, color: '#c0392b' }} />
              <span style={{
                fontSize: '0.65rem', letterSpacing: '0.35em',
                color: '#c0392b', textTransform: 'uppercase', fontWeight: 600,
              }}>Acceso Seguro</span>
            </div>
            <h2 style={{
              fontFamily: "'Bebas Neue', cursive",
              fontSize: 'clamp(2rem, 5vw, 3rem)',
              color: 'white', letterSpacing: '0.04em', lineHeight: 1.05,
            }}>
              BIENVENIDO<br />
              <span style={{ color: 'rgba(255,255,255,0.22)' }}>DE VUELTA</span>
            </h2>
            <p style={{
              color: 'rgba(255,255,255,0.32)', fontSize: '0.83rem',
              marginTop: 8, lineHeight: 1.5,
            }}>
              Ingresá tus credenciales para acceder al panel de gestión.
            </p>
          </div>

          {/* Línea divisora roja */}
          <div style={{
            height: 1,
            background: 'linear-gradient(90deg, rgba(192,57,43,0.55) 0%, rgba(192,57,43,0.1) 60%, transparent 100%)',
            margin: '22px 0',
            animation: 'expand-line 0.9s ease forwards 0.7s',
            transform: 'scaleX(0)', transformOrigin: 'left',
          }} />

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ animation: 'slide-up 0.7s ease forwards 0.5s', opacity: 0 }}>

            {/* Email */}
            <div style={{ marginBottom: 16 }}>
              <label style={{
                display: 'block', fontSize: '0.65rem', letterSpacing: '0.22em',
                color: 'rgba(255,255,255,0.38)', textTransform: 'uppercase',
                marginBottom: 8, fontWeight: 500,
              }}>Correo Electrónico</label>
              <div style={{ position: 'relative' }}>
                <Mail style={{
                  position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                  width: 16, height: 16, color: 'rgba(255,255,255,0.22)', pointerEvents: 'none',
                }} />
                <input
                  type="email" value={email} required
                  onChange={e => setEmail(e.target.value)}
                  placeholder="correo@ejemplo.com"
                  onFocus={focusIn} onBlur={focusOut}
                  style={{ ...inputStyle, padding: '13px 16px 13px 42px' }}
                />
              </div>
            </div>

            {/* Contraseña */}
            <div style={{ marginBottom: 6 }}>
              <label style={{
                display: 'block', fontSize: '0.65rem', letterSpacing: '0.22em',
                color: 'rgba(255,255,255,0.38)', textTransform: 'uppercase',
                marginBottom: 8, fontWeight: 500,
              }}>Contraseña</label>
              <div style={{ position: 'relative' }}>
                <Lock style={{
                  position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                  width: 16, height: 16, color: 'rgba(255,255,255,0.22)', pointerEvents: 'none',
                }} />
                <input
                  type={showPwd ? 'text' : 'password'} value={password} required
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  onFocus={focusIn} onBlur={focusOut}
                  style={{ ...inputStyle, padding: '13px 46px 13px 42px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(v => !v)}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'rgba(255,255,255,0.28)', padding: 4,
                    transition: 'color 0.2s', display: 'flex', alignItems: 'center',
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.28)'}
                >
                  {showPwd ? <EyeOff style={{ width: 15, height: 15 }} /> : <Eye style={{ width: 15, height: 15 }} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                margin: '14px 0 0',
                padding: '10px 14px',
                background: 'rgba(192,57,43,0.1)',
                border: '1px solid rgba(192,57,43,0.35)',
                borderRadius: 10, color: '#e74c3c', fontSize: '0.8rem',
                display: 'flex', alignItems: 'center', gap: 10, lineHeight: 1.4,
              }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#e74c3c', flexShrink: 0 }} />
                {error}
              </div>
            )}

            {/* Botón */}
            <button
              type="submit" disabled={loading}
              style={{
                width: '100%',
                marginTop: 22,
                padding: '14px 20px',
                background: loading
                  ? 'rgba(146,43,33,0.4)'
                  : 'linear-gradient(135deg, #c0392b 0%, #7b1d14 100%)',
                border: 'none', borderRadius: 12,
                color: 'white', fontSize: '0.8rem', fontWeight: 700,
                letterSpacing: '0.18em', textTransform: 'uppercase',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                fontFamily: "'DM Sans', sans-serif",
                boxShadow: loading ? 'none' : '0 6px 28px rgba(192,57,43,0.4), 0 2px 8px rgba(0,0,0,0.4)',
                transition: 'transform 0.2s, box-shadow 0.2s',
                position: 'relative', overflow: 'hidden',
              }}
              onMouseEnter={e => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(-1px)'
                  e.currentTarget.style.boxShadow = '0 10px 36px rgba(192,57,43,0.55), 0 2px 10px rgba(0,0,0,0.5)'
                }
              }}
              onMouseLeave={e => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 6px 28px rgba(192,57,43,0.4), 0 2px 8px rgba(0,0,0,0.4)'
                }
              }}
            >
              {!loading && (
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                  background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)',
                  animation: 'shimmer 3s ease-in-out infinite',
                  pointerEvents: 'none',
                }} />
              )}
              {loading ? (
                <>
                  <div style={{
                    width: 17, height: 17,
                    border: '2px solid rgba(255,255,255,0.25)', borderTopColor: 'white',
                    borderRadius: '50%', animation: 'spin 0.75s linear infinite',
                  }} />
                  Verificando acceso...
                </>
              ) : (
                <>
                  Ingresar al Sistema
                  <ArrowRight style={{ width: 16, height: 16 }} />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div style={{
            marginTop: 28, textAlign: 'center',
            animation: 'slide-up 0.7s ease forwards 0.9s', opacity: 0,
          }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '5px 12px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 999,
            }}>
              <div style={{
                width: 5, height: 5, borderRadius: '50%',
                background: '#22c55e',
                boxShadow: '0 0 6px #22c55e',
                animation: 'ring-pulse 2s ease-in-out infinite',
              }} />
              <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.08em' }}>
                Sistema activo · v1.0.0
              </span>
            </div>
            <p style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.12)', marginTop: 8, letterSpacing: '0.06em' }}>
              Acceso restringido a personal autorizado
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
