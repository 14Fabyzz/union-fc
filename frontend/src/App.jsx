import { useState, useEffect } from 'react'
import { LayoutDashboard, Users, Menu, X, ChevronRight, LogOut, KeyRound } from 'lucide-react'
import Dashboard from './components/Dashboard'
import GestionJugadores from './components/GestionJugadores'
import Login from './components/Login'
import Modal from './components/Modal'

const NAV = [
  { id: 'dashboard', label: 'Mensualidades',   sub: 'Control de pagos',   Icon: LayoutDashboard },
  { id: 'jugadores', label: 'Jugadores',        sub: 'Gestión del plantel', Icon: Users },
]

export default function App() {
  const [loggedIn, setLoggedIn]         = useState(() => !!localStorage.getItem('ufc_token'))
  const [active, setActive]             = useState('dashboard')

  useEffect(() => {
    const handler = () => { setLoggedIn(false) }
    window.addEventListener('ufc:logout', handler)
    return () => window.removeEventListener('ufc:logout', handler)
  }, [])
  const [sidebarOpen, setSidebar]       = useState(false)
  const [changePwdOpen, setChangePwd]   = useState(false)
  const [pwdEmail, setPwdEmail]         = useState('')
  const [pwdCurrent, setPwdCurrent]     = useState('')
  const [pwdNew, setPwdNew]             = useState('')
  const [pwdError, setPwdError]         = useState('')
  const [pwdSuccess, setPwdSuccess]     = useState(false)
  const [pwdLoading, setPwdLoading]     = useState(false)

  const login  = (token, email) => { localStorage.setItem('ufc_token', token); localStorage.setItem('ufc_email', email); setLoggedIn(true) }
  const logout = () => { localStorage.removeItem('ufc_token'); localStorage.removeItem('ufc_email'); setLoggedIn(false) }

  const openChangePwd = () => {
    setPwdEmail(localStorage.getItem('ufc_email') || '')
    setPwdCurrent(''); setPwdNew(''); setPwdError(''); setPwdSuccess(false)
    setChangePwd(true)
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    setPwdLoading(true); setPwdError(''); setPwdSuccess(false)
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('ufc_token')}`,
        },
        body: JSON.stringify({ email: pwdEmail, currentPassword: pwdCurrent, newPassword: pwdNew }),
      })
      const data = await res.json()
      if (res.ok) {
        setPwdSuccess(true)
        setTimeout(() => setChangePwd(false), 1500)
      } else {
        setPwdError(data.error || 'Error al cambiar la contraseña')
      }
    } catch {
      setPwdError('Error de conexión.')
    } finally {
      setPwdLoading(false)
    }
  }

  if (!loggedIn) return <Login onLogin={login} />

  const current = NAV.find(n => n.id === active)

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100">

      {/* ── Overlay mobile ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setSidebar(false)}
        />
      )}

      {/* ── SIDEBAR ── */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-64 flex flex-col
        bg-sidebar-gradient
        transition-transform duration-300 ease-in-out
        lg:relative lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>

        {/* Logo & Brand */}
        <div className="flex items-center gap-3 px-5 py-6 border-b border-white/10">
          <img
            src="/logo.png"
            alt="Unión FC"
            className="w-12 h-12 rounded-full object-cover ring-2 ring-white/30 shadow-lg shrink-0"
          />
          <div className="min-w-0">
            <p className="text-white font-bold text-base leading-tight tracking-wide">UNIÓN FC</p>
            <p className="text-blue-300/70 text-[10px] uppercase tracking-widest mt-0.5">
              Disciplina y Compromiso
            </p>
          </div>
          <button
            className="ml-auto lg:hidden text-white/60 hover:text-white"
            onClick={() => setSidebar(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-5 space-y-1">
          <p className="px-4 mb-2 text-[10px] font-semibold text-blue-300/40 uppercase tracking-widest">
            Módulos
          </p>
          {NAV.map(({ id, label, sub, Icon }) => (
            <button
              key={id}
              onClick={() => { setActive(id); setSidebar(false) }}
              className={`w-full sidebar-link ${active === id ? 'sidebar-link-active' : ''}`}
            >
              <span className={`p-1.5 rounded-lg ${active === id ? 'bg-union-red/80' : 'bg-white/5'}`}>
                <Icon className="w-4 h-4" />
              </span>
              <span className="flex-1 text-left">
                <span className="block leading-tight">{label}</span>
                <span className="block text-[10px] opacity-50 font-normal">{sub}</span>
              </span>
              {active === id && <ChevronRight className="w-3.5 h-3.5 opacity-60" />}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-white/10 space-y-3">
          <button
            onClick={openChangePwd}
            className="w-full flex items-center gap-2 text-blue-300/50 hover:text-white text-xs transition-colors"
          >
            <KeyRound className="w-3.5 h-3.5" />
            Cambiar contraseña
          </button>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-blue-300/50 text-xs">Sistema activo</span>
          </div>
          <p className="text-blue-300/30 text-[10px]">v1.0.0 · Unión FC</p>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top bar */}
        <header className="flex items-center gap-3 px-3 sm:px-6 py-3 sm:py-4 bg-white border-b border-gray-100 shadow-sm shrink-0">
          <button
            className="lg:hidden p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors"
            onClick={() => setSidebar(true)}
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-gray-900 text-lg leading-tight">{current?.label}</h1>
            <p className="text-gray-400 text-xs">{current?.sub}</p>
          </div>

          {/* Club badge (desktop) */}
          <div className="hidden sm:flex items-center gap-2.5 bg-gradient-to-r from-union-navy to-union-navy-mid px-4 py-2 rounded-xl">
            <img src="/logo.png" alt="" className="w-6 h-6 rounded-full object-cover" />
            <span className="text-white text-xs font-bold tracking-wide">UNIÓN FC</span>
          </div>

          {/* Logout */}
          <button
            onClick={logout}
            title="Cerrar sesión"
            className="p-2 rounded-xl text-gray-400 hover:text-union-red hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 sm:py-6">
          {active === 'dashboard' && <Dashboard />}
          {active === 'jugadores' && <GestionJugadores />}
        </main>
      </div>

      {/* Modal cambio de contraseña */}
      {changePwdOpen && (
        <Modal title="Cambiar contraseña" onClose={() => setChangePwd(false)} size="sm">
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Correo electrónico</label>
              <input
                type="email" required value={pwdEmail}
                onChange={e => setPwdEmail(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-union-red"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Contraseña actual</label>
              <input
                type="password" required value={pwdCurrent}
                onChange={e => setPwdCurrent(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-union-red"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Nueva contraseña</label>
              <input
                type="password" required minLength={8} value={pwdNew}
                onChange={e => setPwdNew(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-union-red"
              />
            </div>

            {pwdError && (
              <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{pwdError}</p>
            )}
            {pwdSuccess && (
              <p className="text-sm text-emerald-600 bg-emerald-50 rounded-lg px-3 py-2">Contraseña actualizada correctamente.</p>
            )}

            <button
              type="submit" disabled={pwdLoading}
              className="w-full bg-union-red text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {pwdLoading ? 'Guardando...' : 'Actualizar contraseña'}
            </button>
          </form>
        </Modal>
      )}
    </div>
  )
}
