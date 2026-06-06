import { defineStore } from 'pinia'
import { authApi } from '@/api/admin'
import type { AdminProfile, LoginResult, PermissionCode } from '@/types/api'
import {
  clearSession,
  persistAdmin,
  persistSession,
  readAdmin,
  readExpiresAt,
  readToken,
  readTokenType,
} from '@/utils/storage'

function roleCodes(admin: AdminProfile | null) {
  return (admin?.roles || []).map((role) => role.code || role.name).filter(Boolean)
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: readToken(),
    tokenType: readTokenType(),
    expiresAt: readExpiresAt(),
    admin: readAdmin() as AdminProfile | null,
    bootstrapped: false,
  }),
  getters: {
    isLoggedIn: (state) => Boolean(state.token),
    displayName: (state) => state.admin?.nickname || state.admin?.username || '管理员',
    permissionSet: (state) => new Set(state.admin?.permissions || []),
    isSuperAdmin: (state) => roleCodes(state.admin).includes('super_admin'),
  },
  actions: {
    can(permission?: PermissionCode) {
      if (!permission) return true
      if (this.isSuperAdmin) return true
      return this.permissionSet.has(permission)
    },
    applyLogin(payload: LoginResult) {
      this.token = payload.token
      this.tokenType = payload.token_type || 'Bearer'
      this.expiresAt = payload.expires_at
      this.admin = payload.admin
      this.bootstrapped = true
      persistSession(payload)
    },
    async login(account: string, password: string) {
      const result = await authApi.login(account, password)
      this.applyLogin(result)
    },
    async hydrate() {
      if (!this.token || this.bootstrapped) return
      const admin = await authApi.me()
      this.admin = admin
      this.bootstrapped = true
      persistAdmin(admin)
    },
    async refresh() {
      const result = await authApi.refresh()
      this.applyLogin(result)
    },
    async logout() {
      try {
        if (this.token) await authApi.logout()
      } finally {
        this.token = ''
        this.tokenType = 'Bearer'
        this.expiresAt = ''
        this.admin = null
        this.bootstrapped = false
        clearSession()
      }
    },
    async changePassword(old_password: string, new_password: string) {
      await authApi.changePassword({ old_password, new_password })
    },
  },
})
