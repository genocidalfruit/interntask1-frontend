export class ApiError extends Error {
  /**
   * @param {string} message
   * @param {number} status
   */
  constructor(message, status) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

function normalizeBase() {
  const raw = import.meta.env.VITE_API_URL ?? ''
  return String(raw).replace(/\/$/, '')
}

/**
 * @param {string} path
 * @param {RequestInit} [options]
 */
async function request(path, options = {}) {
  const base = normalizeBase()
  const url = `${base}${path.startsWith('/') ? path : `/${path}`}`
  const headers = {
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...options.headers,
  }
  const res = await fetch(url, { ...options, headers })
  const text = await res.text()
  let data
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = { message: text || 'Invalid response' }
  }
  if (!res.ok) {
    const msg = data?.message
    const message =
      typeof msg === 'string' ? msg : Array.isArray(msg) ? msg.join(', ') : res.statusText
    throw new ApiError(message || 'Request failed', res.status)
  }
  return data
}

export function getAssets() {
  return request('/api/assets')
}

/**
 * @param {Record<string, unknown>} data
 */
export function createAsset(data) {
  return request('/api/assets', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function getAssetById(id) {
  return request(`/api/assets/${encodeURIComponent(id)}`)
}

export function deleteAsset(id) {
  return request(`/api/assets/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })
}
