import { useState, useEffect, useMemo } from 'react'
import {
  CheckCircle2, XCircle, Users, Clock,
  Search, ChevronLeft, ChevronRight,
  TrendingUp, Eye, EyeOff,
} from 'lucide-react'
import { api } from '../services/api'

// ── Helpers ───────────────────────────────────────────────────────────────────

function getMonthStr(offset = 0) {
  const d = new Date()
  d.setMonth(d.getMonth() + offset)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function formatMonthLabel(ym) {
  const [y, m] = ym.split('-')
  return new Date(+y, +m - 1, 1)
    .toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
    .replace(/^\w/, c => c.toUpperCase())
}

const CAT_COLORS = [
  { pill: 'bg-blue-100 text-blue-700 border-blue-200',   avatar: 'bg-blue-600'   },
  { pill: 'bg-violet-100 text-violet-700 border-violet-200', avatar: 'bg-violet-600' },
  { pill: 'bg-amber-100 text-amber-700 border-amber-200',  avatar: 'bg-amber-600'  },
  { pill: 'bg-cyan-100 text-cyan-700 border-cyan-200',    avatar: 'bg-cyan-600'   },
  { pill: 'bg-pink-100 text-pink-700 border-pink-200',    avatar: 'bg-pink-600'   },
  { pill: 'bg-emerald-100 text-emerald-700 border-emerald-200', avatar: 'bg-emerald-600' },
]

// ── Stat Card ─────────────────────────────────────────────────────────────────

function StatCard({ label, value, Icon, gradient, pct }) {
  return (
    <div className={`card p-5 flex flex-col gap-3 ${gradient}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider opacity-70">{label}</p>
          <p className="text-4xl font-extrabold mt-1 leading-none">{value}</p>
        </div>
        <span className="p-2.5 rounded-xl bg-white/20">
          <Icon className="w-5 h-5" />
        </span>
      </div>
      {pct !== undefined && (
        <div>
          <div className="h-1.5 rounded-full bg-white/25">
            <div className="h-1.5 rounded-full bg-white transition-all duration-700"
                 style={{ width: `${pct}%` }} />
          </div>
          <p className="text-[10px] mt-1 opacity-60">{pct}% del total</p>
        </div>
      )}
    </div>
  )
}

// ── Payment Toggle Button ─────────────────────────────────────────────────────

function PayBtn({ paid, onClick, loading }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`
        relative flex items-center gap-1.5 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl font-semibold text-xs sm:text-sm
        transition-all duration-200 select-none shrink-0 justify-center
        ${paid
          ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-200'
          : 'bg-red-50 hover:bg-red-100 text-red-600 border border-red-200'
        }
        ${loading ? 'opacity-50 cursor-not-allowed scale-95' : 'active:scale-95'}
      `}
    >
      {loading ? (
        <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : paid ? (
        <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      ) : (
        <XCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      )}
      <span>{paid ? 'Pagado' : 'Pendiente'}</span>
    </button>
  )
}

// ── Player Row ────────────────────────────────────────────────────────────────

function PlayerRow({ student, paid, onToggle, colors }) {
  const [loading, setLoading] = useState(false)
  const initials = student.nombre.split(' ').slice(0, 2).map(w => w[0]).join('')

  async function handle() {
    setLoading(true)
    await onToggle(student)
    setLoading(false)
  }

  return (
    <div className={`
      card px-3 sm:px-5 py-3 sm:py-3.5 flex items-center gap-2 sm:gap-4
      hover:shadow-card-hover transition-shadow duration-200
      ${!paid ? 'border-l-4 border-l-red-300' : 'border-l-4 border-l-emerald-400'}
    `}>
      {/* Avatar */}
      <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl ${colors.avatar} text-white flex items-center
                       justify-center font-bold text-sm shrink-0 shadow-sm`}>
        {initials}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 truncate leading-tight text-sm sm:text-base">{student.nombre}</p>
        <p className="text-xs text-gray-400 mt-0.5 truncate">{student.identificacion}</p>
      </div>

      {/* Category */}
      <span className={`hidden sm:inline-flex badge border ${colors.pill} shrink-0`}>
        {student.categoria}
      </span>

      {/* Toggle */}
      <PayBtn paid={paid} onClick={handle} loading={loading} />
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const [students, setStudents]       = useState([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState(null)
  const [monthOffset, setMonthOffset] = useState(0)
  const [selectedCat, setSelectedCat] = useState('all')
  const [hidePaid, setHidePaid]       = useState(false)
  const [search, setSearch]           = useState('')

  const currentMonth = getMonthStr(monthOffset)

  useEffect(() => { fetchStudents() }, [])

  async function fetchStudents() {
    setLoading(true); setError(null)
    try { setStudents(await api.getActivos()) }
    catch { setError('No se pudo conectar con el servidor.') }
    finally { setLoading(false) }
  }

  const categories = useMemo(() =>
    [...new Set(students.map(s => s.categoria))].sort(), [students])

  const colorMap = useMemo(() =>
    Object.fromEntries(categories.map((c, i) => [c, CAT_COLORS[i % CAT_COLORS.length]])),
    [categories])

  const isPaid = s => s.mesesPagados.includes(currentMonth)

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return students
      .filter(s => selectedCat === 'all' || s.categoria === selectedCat)
      .filter(s => !hidePaid || !isPaid(s))
      .filter(s => !q || s.nombre.toLowerCase().includes(q) || s.identificacion.includes(q))
  }, [students, selectedCat, hidePaid, search, currentMonth])

  const stats = useMemo(() => {
    const scope = selectedCat === 'all' ? students : students.filter(s => s.categoria === selectedCat)
    const paid  = scope.filter(isPaid).length
    return { total: scope.length, paid, pending: scope.length - paid }
  }, [students, selectedCat, currentMonth])

  async function handleToggle(student) {
    const wasPaid = isPaid(student)
    setStudents(prev => prev.map(s => {
      if (s.id !== student.id) return s
      const meses = wasPaid
        ? s.mesesPagados.filter(m => m !== currentMonth)
        : [...s.mesesPagados, currentMonth]
      return { ...s, mesesPagados: meses }
    }))
    try { await api.togglePago(student.id, currentMonth) }
    catch {
      setStudents(prev => prev.map(s => {
        if (s.id !== student.id) return s
        const meses = wasPaid
          ? [...s.mesesPagados, currentMonth]
          : s.mesesPagados.filter(m => m !== currentMonth)
        return { ...s, mesesPagados: meses }
      }))
    }
  }

  // ── Loading / Error ─────────────────────────────────────────────────────────

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-32 gap-4">
      <div className="w-12 h-12 border-4 border-union-navy border-t-union-red rounded-full animate-spin" />
      <p className="text-gray-400 text-sm font-medium">Cargando plantel…</p>
    </div>
  )

  if (error) return (
    <div className="flex flex-col items-center justify-center py-32 gap-4">
      <div className="text-5xl">⚠️</div>
      <p className="text-gray-600 font-medium">{error}</p>
      <button onClick={fetchStudents} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-union-red hover:bg-union-red-dark text-white text-sm font-semibold shadow-sm transition-all duration-150 active:scale-95">Reintentar</button>
    </div>
  )

  const pctPaid    = stats.total ? Math.round(stats.paid    / stats.total * 100) : 0
  const pctPending = stats.total ? Math.round(stats.pending / stats.total * 100) : 0

  return (
    <div className="space-y-6 max-w-4xl mx-auto">

      {/* ── Month Selector ── */}
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 leading-tight truncate">
            Mensualidades
          </h2>
          <p className="text-union-navy font-semibold text-sm sm:text-base capitalize mt-0.5 truncate">
            {formatMonthLabel(currentMonth)}
          </p>
        </div>
        <div className="flex items-center gap-1 sm:gap-2 bg-white rounded-xl border border-gray-200 shadow-card p-1 shrink-0">
          <button
            onClick={() => setMonthOffset(o => o - 1)}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setMonthOffset(0)}
            disabled={monthOffset === 0}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors
              ${monthOffset === 0
                ? 'bg-union-navy text-white'
                : 'text-gray-500 hover:bg-gray-100'}`}
          >
            Hoy
          </button>
          <button
            onClick={() => setMonthOffset(o => o + 1)}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Total Jugadores" value={stats.total}
          Icon={Users}
          gradient="card text-union-navy bg-gradient-to-br from-slate-50 to-blue-50"
        />
        <StatCard
          label="Pagados" value={stats.paid}
          Icon={CheckCircle2}
          gradient="card text-emerald-800 bg-gradient-to-br from-emerald-50 to-green-100"
          pct={pctPaid}
        />
        <StatCard
          label="Pendientes" value={stats.pending}
          Icon={Clock}
          gradient="card text-red-800 bg-gradient-to-br from-red-50 to-rose-100"
          pct={pctPending}
        />
      </div>

      {/* ── Filters ── */}
      <div className="card p-4 space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar jugador o número de identificación…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input pl-10"
          />
        </div>

        {/* Category + hide-paid row */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCat('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all
                ${selectedCat === 'all'
                  ? 'bg-union-navy text-white border-union-navy shadow-sm'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}
            >
              Todas ({students.length})
            </button>
            {categories.map(cat => {
              const count = students.filter(s => s.categoria === cat).length
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCat(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all
                    ${selectedCat === cat
                      ? 'bg-union-navy text-white border-union-navy shadow-sm'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}
                >
                  {cat} ({count})
                </button>
              )
            })}
          </div>

          {/* Hide paid toggle */}
          <button
            onClick={() => setHidePaid(v => !v)}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold
                        border transition-all
              ${hidePaid
                ? 'bg-union-red text-white border-union-red shadow-sm'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}
          >
            {hidePaid ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            {hidePaid ? 'Mostrando pendientes' : 'Ocultar pagados'}
          </button>
        </div>
      </div>

      {/* ── Progress bar summary ── */}
      {stats.total > 0 && (
        <div className="card px-5 py-3.5 flex items-center gap-4">
          <TrendingUp className="w-4 h-4 text-union-navy shrink-0" />
          <div className="flex-1">
            <div className="flex justify-between text-xs font-medium text-gray-500 mb-1.5">
              <span>Recaudo del mes</span>
              <span className="text-union-navy font-bold">{pctPaid}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-2 bg-gradient-to-r from-union-navy to-emerald-500 rounded-full transition-all duration-700"
                style={{ width: `${pctPaid}%` }}
              />
            </div>
          </div>
          <span className="text-xs text-gray-400 shrink-0">{stats.paid}/{stats.total}</span>
        </div>
      )}

      {/* ── Player List ── */}
      {filtered.length === 0 ? (
        <div className="card py-20 flex flex-col items-center gap-3 text-center">
          <div className="text-5xl">
            {hidePaid ? '🏆' : '🔍'}
          </div>
          <p className="font-semibold text-gray-700">
            {hidePaid ? '¡Todos al día!' : 'Sin resultados'}
          </p>
          <p className="text-sm text-gray-400">
            {hidePaid
              ? 'No hay pagos pendientes para este filtro.'
              : 'Intenta con otro nombre o categoría.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map(s => (
            <PlayerRow
              key={s.id}
              student={s}
              paid={isPaid(s)}
              onToggle={handleToggle}
              colors={colorMap[s.categoria] ?? CAT_COLORS[0]}
            />
          ))}
          <p className="text-center text-xs text-gray-400 pt-2">
            {filtered.length} jugador{filtered.length !== 1 ? 'es' : ''} mostrado{filtered.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  )
}
