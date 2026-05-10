import { useState } from 'react'
import { LayoutDashboard, Users, Menu, X, ChevronRight } from 'lucide-react'
import Dashboard from './components/Dashboard'
import GestionJugadores from './components/GestionJugadores'

const NAV = [
  { id: 'dashboard', label: 'Mensualidades',   sub: 'Control de pagos',   Icon: LayoutDashboard },
  { id: 'jugadores', label: 'Jugadores',        sub: 'Gestión del plantel', Icon: Users },
]

export default function App() {
  const [active, setActive]         = useState('dashboard')
  const [sidebarOpen, setSidebar]   = useState(false)

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
        <div className="px-5 py-4 border-t border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-blue-300/50 text-xs">Sistema activo</span>
          </div>
          <p className="text-blue-300/30 text-[10px] mt-1">v1.0.0 · Unión FC</p>
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
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 sm:py-6">
          {active === 'dashboard' && <Dashboard />}
          {active === 'jugadores' && <GestionJugadores />}
        </main>
      </div>
    </div>
  )
}
