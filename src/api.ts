const API_BASE = import.meta.env?.VITE_API_BASE || ''

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>
}

export async function adminRequest<T>(url: string, options?: RequestOptions): Promise<T> {
  const { params, ...init } = options || {}

  let finalUrl = `${API_BASE}${url}`
  if (params) {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') searchParams.set(key, String(value))
    })
    const qs = searchParams.toString()
    if (qs) finalUrl += (finalUrl.includes('?') ? '&' : '?') + qs
  }

  const token = localStorage.getItem('admin-token')
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string>),
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(finalUrl, { ...init, headers })
  const data = await res.json()

  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem('admin-token')
      localStorage.removeItem('admin-user')
      window.location.href = '/login'
    }
    throw new Error(data.error || '请求失败')
  }

  return data as T
}
