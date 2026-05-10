const BASE = (import.meta.env.VITE_API_URL ?? '') + '/api'

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `HTTP ${res.status}`)
  }
  return res.json()
}

export const api = {
  // Estudiantes
  getAll:      ()           => request('/estudiantes'),
  getActivos:  ()           => request('/estudiantes?activos=true'),
  create:      (data)       => request('/estudiantes', { method: 'POST', body: JSON.stringify(data) }),
  update:      (id, data)   => request(`/estudiantes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  toggleEstado:(id, activo) => request(`/estudiantes/${id}/estado`, { method: 'PATCH', body: JSON.stringify({ activo }) }),
  togglePago:  (id, mes)    => request(`/estudiantes/${id}/pago`, { method: 'PATCH', body: JSON.stringify({ mes }) }),
}
