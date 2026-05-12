import { useState, useEffect, useMemo } from 'react'
import {
  Plus, Search, Pencil, UserCheck, UserX,
  ChevronUp, ChevronDown, Save, Loader2,
  Users, ShieldCheck, ShieldOff,
} from 'lucide-react'
import { api } from '../services/api'
import Modal from './Modal'

// ── Form ─────────────────────────────────────────────────────────────────────

const EMPTY = { identificacion: '', nombre: '', categoria: '', telefono: '' }

function JugadorForm({ initial = EMPTY, onSubmit, submitting }) {
  const [form, setForm] = useState(initial)
  const set = f => e => setForm(p => ({ ...p, [f]: e.target.value }))

  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit(form) }} className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
          Identificación *
        </label>
        <input required value={form.identificacion} onChange={set('identificacion')}
               placeholder="Ej. 1234567890" className="input" />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
          Nombre completo *
        </label>
        <input required value={form.nombre} onChange={set('nombre')}
               placeholder="Ej. Carlos Andrés Pérez" className="input" />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
          Categoría *
        </label>
        <input required value={form.categoria} onChange={set('categoria')}
               placeholder="Ej. Sub-12" className="input" />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
          Teléfono WhatsApp
        </label>
        <input value={form.telefono ?? ''} onChange={set('telefono')}
               placeholder="Ej. 573001234567" className="input" />
        <p className="text-xs text-gray-400 mt-1">Incluye el código de país. Ej: 57 para Colombia.</p>
      </div>
      <button type="submit" disabled={submitting} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-union-red hover:bg-union-red-dark text-white text-sm font-semibold shadow-sm transition-all duration-150 active:scale-95 w-full justify-center py-3">
        {submitting
          ? <><Loader2 className="w-4 h-4 animate-spin" /> Guardando…</>
          : <><Save className="w-4 h-4" /> Guardar jugador</>
        }
      </button>
    </form>
  )
}

// ── Sort Header ───────────────────────────────────────────────────────────────

function Th({ label, field, sort, onSort }) {
  const active = sort.field === field
  return (
    <th className="px-4 py-3.5 text-left cursor-pointer select-none group" onClick={() => onSort(field)}>
      <span className="flex items-center gap-1 text-xs font-semibold text-gray-400 uppercase tracking-wide
                       group-hover:text-gray-600 transition-colors">
        {label}
        {active
          ? sort.dir === 'asc'
            ? <ChevronUp className="w-3.5 h-3.5 text-union-navy" />
            : <ChevronDown className="w-3.5 h-3.5 text-union-navy" />
          : <ChevronUp className="w-3.5 h-3.5 opacity-20" />}
      </span>
    </th>
  )
}

// ── Toast ─────────────────────────────────────────────────────────────────────

function Toast({ msg, type }) {
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3
                     rounded-xl shadow-xl text-sm font-semibold text-white
                     animate-in transition-all
                     ${type === 'error' ? 'bg-red-600' : 'bg-emerald-600'}`}
         style={{ animation: 'modal-in .18s ease-out' }}>
      {type === 'error' ? <ShieldOff className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
      {msg}
      <style>{`@keyframes modal-in{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  )
}

// ── Main ─────────────────────────────────────────────────────────────────────

export default function GestionJugadores() {
  const [students, setStudents]      = useState([])
  const [loading, setLoading]        = useState(true)
  const [error, setError]            = useState(null)
  const [search, setSearch]          = useState('')
  const [filterActivo, setFilter]    = useState('all')
  const [sort, setSort]              = useState({ field: 'nombre', dir: 'asc' })
  const [modal, setModal]            = useState(null)
  const [submitting, setSubmitting]  = useState(false)
  const [toast, setToast]            = useState(null)

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    setLoading(true); setError(null)
    try { setStudents(await api.getAll()) }
    catch { setError('No se pudo cargar el plantel.') }
    finally { setLoading(false) }
  }

  function showToast(msg, type = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  function handleSort(field) {
    setSort(p => p.field === field
      ? { field, dir: p.dir === 'asc' ? 'desc' : 'asc' }
      : { field, dir: 'asc' })
  }

  const displayed = useMemo(() => {
    const q = search.toLowerCase()
    return [...students]
      .filter(s =>
        filterActivo === 'all' ||
        (filterActivo === 'activo' && s.activo) ||
        (filterActivo === 'inactivo' && !s.activo))
      .filter(s => !q || s.nombre.toLowerCase().includes(q) || s.identificacion.includes(q))
      .sort((a, b) => {
        const va = String(a[sort.field] ?? '').toLowerCase()
        const vb = String(b[sort.field] ?? '').toLowerCase()
        return sort.dir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va)
      })
  }, [students, search, filterActivo, sort])

  // ── Handlers ─────────────────────────────────────────────────────────────

  async function handleCreate(form) {
    setSubmitting(true)
    try {
      const nuevo = await api.create(form)
      setStudents(p => [...p, nuevo])
      setModal(null)
      showToast('Jugador registrado correctamente.')
    } catch (e) { showToast(e.message, 'error') }
    finally { setSubmitting(false) }
  }

  async function handleUpdate(form) {
    setSubmitting(true)
    try {
      const updated = await api.update(modal.id, form)
      setStudents(p => p.map(s => s.id === updated.id ? updated : s))
      setModal(null)
      showToast('Jugador actualizado.')
    } catch (e) { showToast(e.message, 'error') }
    finally { setSubmitting(false) }
  }

  async function handleToggleEstado(student) {
    try {
      const updated = await api.toggleEstado(student.id, !student.activo)
      setStudents(p => p.map(s => s.id === updated.id ? updated : s))
      showToast(updated.activo ? 'Jugador activado.' : 'Jugador inactivado.')
    } catch (e) { showToast(e.message, 'error') }
  }

  // ── Counts ────────────────────────────────────────────────────────────────

  const totalActivos   = students.filter(s =>  s.activo).length
  const totalInactivos = students.filter(s => !s.activo).length

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {toast && <Toast {...toast} />}

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900">Plantel</h2>
          <p className="text-gray-400 text-sm mt-0.5">Administra los jugadores de Unión FC</p>
        </div>
        <button onClick={() => setModal('new')} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-union-red hover:bg-union-red-dark text-white text-sm font-semibold shadow-sm transition-all duration-150 active:scale-95">
          <Plus className="w-4 h-4" /> Nuevo Jugador
        </button>
      </div>

      {/* Summary pills */}
      <div className="flex gap-3 flex-wrap">
        {[
          { v: 'all',      label: 'Todos',     count: students.length,  Icon: Users       },
          { v: 'activo',   label: 'Activos',   count: totalActivos,     Icon: ShieldCheck },
          { v: 'inactivo', label: 'Inactivos', count: totalInactivos,   Icon: ShieldOff   },
        ].map(({ v, label, count, Icon }) => (
          <button
            key={v}
            onClick={() => setFilter(v)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold
                        transition-all shadow-card
              ${filterActivo === v
                ? 'bg-union-navy text-white border-union-navy'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}
          >
            <Icon className="w-4 h-4" />
            {label}
            <span className={`text-xs px-1.5 py-0.5 rounded-md font-bold
              ${filterActivo === v ? 'bg-white/20' : 'bg-gray-100'}`}>
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          placeholder="Buscar por nombre o número de identificación…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input pl-11 shadow-card"
        />
      </div>

      {/* Table / Cards */}
      {loading ? (
        <div className="card flex justify-center py-24">
          <div className="w-10 h-10 border-4 border-union-navy border-t-union-red rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="card py-16 text-center text-red-500 font-medium">{error}</div>
      ) : displayed.length === 0 ? (
        <div className="card py-16 text-center text-gray-400">No se encontraron jugadores.</div>
      ) : (
        <>
          {/* ── Mobile cards (< md) ── */}
          <div className="md:hidden space-y-2.5">
            {displayed.map(s => {
              const initials = s.nombre.split(' ').slice(0, 2).map(w => w[0]).join('')
              return (
                <div key={s.id} className={`card px-4 py-3.5 ${!s.activo ? 'opacity-60' : ''}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center
                                    text-white font-bold text-sm shrink-0
                                    ${s.activo ? 'bg-union-navy' : 'bg-gray-400'}`}>
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate leading-tight">{s.nombre}</p>
                      <p className="text-xs text-gray-400 font-mono mt-0.5">{s.identificacion}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => setModal(s)}
                        className="p-2 rounded-lg text-gray-400 hover:text-union-navy hover:bg-blue-50 transition-colors"
                        title="Editar"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleToggleEstado(s)}
                        className={`p-2 rounded-lg transition-colors
                          ${s.activo
                            ? 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                            : 'text-gray-400 hover:text-emerald-600 hover:bg-emerald-50'}`}
                        title={s.activo ? 'Inactivar' : 'Activar'}
                      >
                        {s.activo ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2.5 ml-13">
                    <span className="badge bg-blue-50 text-blue-700 border border-blue-100">
                      {s.categoria}
                    </span>
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold
                                     px-2.5 py-0.5 rounded-full
                      ${s.activo ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full
                        ${s.activo ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
                      {s.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>
              )
            })}
            <p className="text-center text-xs text-gray-400 pt-1">
              {displayed.length} de {students.length} jugadores
            </p>
          </div>

          {/* ── Desktop table (≥ md) ── */}
          <div className="hidden md:block card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50/80 border-b border-gray-100">
                  <tr>
                    <Th label="Jugador"        field="nombre"         sort={sort} onSort={handleSort} />
                    <Th label="Identificación"  field="identificacion" sort={sort} onSort={handleSort} />
                    <Th label="Categoría"      field="categoria"      sort={sort} onSort={handleSort} />
                    <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Estado</th>
                    <th className="px-4 py-3.5 text-right text-xs font-semibold text-gray-400 uppercase tracking-wide">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {displayed.map(s => {
                    const initials = s.nombre.split(' ').slice(0, 2).map(w => w[0]).join('')
                    return (
                      <tr key={s.id}
                          className={`hover:bg-blue-50/40 transition-colors ${!s.activo ? 'opacity-50' : ''}`}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center
                                            text-white font-bold text-xs shrink-0
                                            ${s.activo ? 'bg-union-navy' : 'bg-gray-400'}`}>
                              {initials}
                            </div>
                            <span className="font-semibold text-gray-900">{s.nombre}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-500 font-mono text-xs">{s.identificacion}</td>
                        <td className="px-4 py-3">
                          <span className="badge bg-blue-50 text-blue-700 border border-blue-100">
                            {s.categoria}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold
                                           px-2.5 py-1 rounded-full
                            ${s.activo ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full
                              ${s.activo ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
                            {s.activo ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => setModal(s)}
                              className="p-2 rounded-lg text-gray-400 hover:text-union-navy
                                         hover:bg-blue-50 transition-colors"
                              title="Editar"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleToggleEstado(s)}
                              className={`p-2 rounded-lg transition-colors
                                ${s.activo
                                  ? 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                                  : 'text-gray-400 hover:text-emerald-600 hover:bg-emerald-50'}`}
                              title={s.activo ? 'Inactivar' : 'Activar'}
                            >
                              {s.activo ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/60 flex items-center justify-between">
              <p className="text-xs text-gray-400">
                {displayed.length} de {students.length} jugadores
              </p>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-xs text-gray-400">{totalActivos} activos</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── Modals ── */}
      {modal === 'new' && (
        <Modal title="Registrar Jugador" onClose={() => setModal(null)}>
          <JugadorForm onSubmit={handleCreate} submitting={submitting} />
        </Modal>
      )}
      {modal && modal !== 'new' && (
        <Modal title="Editar Jugador" onClose={() => setModal(null)}>
          <JugadorForm
            initial={{ identificacion: modal.identificacion, nombre: modal.nombre, categoria: modal.categoria, telefono: modal.telefono ?? '' }}
            onSubmit={handleUpdate}
            submitting={submitting}
          />
        </Modal>
      )}
    </div>
  )
}
