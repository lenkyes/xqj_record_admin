import type { AdminProfile } from '@/types/api'

const TOKEN_KEY = 'xqj_admin_token'
const TOKEN_TYPE_KEY = 'xqj_admin_token_type'
const EXPIRES_AT_KEY = 'xqj_admin_expires_at'
const ADMIN_KEY = 'xqj_admin_profile'

export function readToken() {
  return localStorage.getItem(TOKEN_KEY) || ''
}

export function readTokenType() {
  return localStorage.getItem(TOKEN_TYPE_KEY) || 'Bearer'
}

export function readExpiresAt() {
  return localStorage.getItem(EXPIRES_AT_KEY) || ''
}

export function readAdmin(): AdminProfile | null {
  const raw = localStorage.getItem(ADMIN_KEY)
  if (!raw) return null

  try {
    return JSON.parse(raw) as AdminProfile
  } catch {
    return null
  }
}

export function persistSession(payload: {
  token: string
  token_type: string
  expires_at: string
  admin: AdminProfile
}) {
  localStorage.setItem(TOKEN_KEY, payload.token)
  localStorage.setItem(TOKEN_TYPE_KEY, payload.token_type || 'Bearer')
  localStorage.setItem(EXPIRES_AT_KEY, payload.expires_at)
  localStorage.setItem(ADMIN_KEY, JSON.stringify(payload.admin))
}

export function persistAdmin(admin: AdminProfile) {
  localStorage.setItem(ADMIN_KEY, JSON.stringify(admin))
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(TOKEN_TYPE_KEY)
  localStorage.removeItem(EXPIRES_AT_KEY)
  localStorage.removeItem(ADMIN_KEY)
}
