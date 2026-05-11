const API_BASE = 'http://localhost:3001'

function getToken() {
  return localStorage.getItem('admin-token') || ''
}

async function adminRequest<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
      ...((options.headers as Record<string, string>) || {}),
    },
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || '请求失败')
  return data as T
}

export { API_BASE, adminRequest }
