import { requestData, normalizePage } from './http'
import type {
  AdminProfile,
  AppRelease,
  AppUser,
  DashboardData,
  Family,
  FamilyMember,
  HealthData,
  ItemRecord,
  LoginLog,
  LoginResult,
  MediaRecord,
  NotificationRecord,
  OperationLog,
  PageQuery,
  PageResult,
  Permission,
  Role,
} from '@/types/api'

function list<T>(url: string, params?: PageQuery) {
  return requestData<PageResult<T> | T[]>({ url, method: 'GET', params }).then(normalizePage<T>)
}

export const authApi = {
  login(account: string, password: string) {
    return requestData<LoginResult>({
      url: '/auth/login',
      method: 'POST',
      data: { account, password },
    })
  },
  logout() {
    return requestData<null>({ url: '/auth/logout', method: 'POST' })
  },
  refresh() {
    return requestData<LoginResult>({ url: '/auth/refresh', method: 'POST' })
  },
  me() {
    return requestData<AdminProfile>({ url: '/me', method: 'GET' })
  },
  changePassword(data: { old_password: string; new_password: string }) {
    return requestData<null>({ url: '/me/password', method: 'PATCH', data })
  },
}

export const dashboardApi = {
  overview() {
    return requestData<DashboardData>({ url: '/dashboard', method: 'GET' })
  },
  health() {
    return requestData<HealthData>({ url: '/health', method: 'GET' })
  },
}

export const rbacApi = {
  permissions() {
    return requestData<Permission[]>({ url: '/permissions', method: 'GET' })
  },
  roles(params?: PageQuery) {
    return list<Role>('/roles', params)
  },
  createRole(data: Partial<Role> & { permission_codes?: string[] }) {
    return requestData<Role>({ url: '/roles', method: 'POST', data })
  },
  updateRole(id: number, data: Partial<Role> & { permission_codes?: string[] }) {
    return requestData<Role>({ url: `/roles/${id}`, method: 'PATCH', data })
  },
  deleteRole(id: number) {
    return requestData<null>({ url: `/roles/${id}`, method: 'DELETE' })
  },
}

export const adminsApi = {
  list(params?: PageQuery) {
    return list<AdminProfile>('/admins', params)
  },
  create(data: Partial<AdminProfile> & { password?: string; role_ids?: number[] }) {
    return requestData<AdminProfile>({ url: '/admins', method: 'POST', data })
  },
  update(id: number, data: Partial<AdminProfile>) {
    return requestData<AdminProfile>({ url: `/admins/${id}`, method: 'PATCH', data })
  },
  setRoles(id: number, role_ids: number[]) {
    return requestData<AdminProfile>({ url: `/admins/${id}/roles`, method: 'POST', data: { role_ids } })
  },
  disable(id: number) {
    return requestData<null>({ url: `/admins/${id}/disable`, method: 'POST' })
  },
  enable(id: number) {
    return requestData<null>({ url: `/admins/${id}/enable`, method: 'POST' })
  },
}

export const usersApi = {
  list(params?: PageQuery) {
    return list<AppUser>('/users', params)
  },
  detail(id: number) {
    return requestData<AppUser>({ url: `/users/${id}`, method: 'GET' })
  },
  update(id: number, data: Partial<AppUser>) {
    return requestData<AppUser>({ url: `/users/${id}`, method: 'PATCH', data })
  },
  disable(id: number) {
    return requestData<null>({ url: `/users/${id}/disable`, method: 'POST' })
  },
  enable(id: number) {
    return requestData<null>({ url: `/users/${id}/enable`, method: 'POST' })
  },
}

export const familiesApi = {
  list(params?: PageQuery) {
    return list<Family>('/families', params)
  },
  detail(id: number) {
    return requestData<Family>({ url: `/families/${id}`, method: 'GET' })
  },
  members(id: number, params?: PageQuery) {
    return list<FamilyMember>(`/families/${id}/members`, params)
  },
  items(id: number, params?: PageQuery) {
    return list<ItemRecord>(`/families/${id}/items`, params)
  },
  update(id: number, data: Partial<Family>) {
    return requestData<Family>({ url: `/families/${id}`, method: 'PATCH', data })
  },
}

export const itemsApi = {
  list(params?: PageQuery) {
    return list<ItemRecord>('/items', params)
  },
  detail(id: number) {
    return requestData<ItemRecord>({ url: `/items/${id}`, method: 'GET' })
  },
  update(id: number, data: Partial<ItemRecord>) {
    return requestData<ItemRecord>({ url: `/items/${id}`, method: 'PATCH', data })
  },
  remove(id: number) {
    return requestData<null>({ url: `/items/${id}`, method: 'DELETE' })
  },
}

export const mediaApi = {
  list(params?: PageQuery) {
    return list<MediaRecord>('/media', params)
  },
  remove(id: number) {
    return requestData<null>({ url: `/media/${id}`, method: 'DELETE' })
  },
}

export const releasesApi = {
  list(params?: PageQuery) {
    return list<AppRelease>('/app/releases', params)
  },
  detail(id: number) {
    return requestData<AppRelease>({ url: `/app/releases/${id}`, method: 'GET' })
  },
  create(data: FormData | Partial<AppRelease>) {
    return requestData<AppRelease>({ url: '/app/releases', method: 'POST', data })
  },
  update(id: number, data: FormData | Partial<AppRelease>) {
    return requestData<AppRelease>({ url: `/app/releases/${id}`, method: 'PATCH', data })
  },
  publish(id: number) {
    return requestData<AppRelease>({ url: `/app/releases/${id}/publish`, method: 'POST' })
  },
  unpublish(id: number) {
    return requestData<AppRelease>({ url: `/app/releases/${id}/unpublish`, method: 'POST' })
  },
  remove(id: number) {
    return requestData<null>({ url: `/app/releases/${id}`, method: 'DELETE' })
  },
}

export const notificationsApi = {
  list(params?: PageQuery) {
    return list<NotificationRecord>('/notifications', params)
  },
  create(data: Partial<NotificationRecord>) {
    return requestData<NotificationRecord>({ url: '/notifications', method: 'POST', data })
  },
}

export const auditApi = {
  operationLogs(params?: PageQuery) {
    return list<OperationLog>('/operation-logs', params)
  },
  operationLog(id: number | string) {
    return requestData<OperationLog>({ url: `/operation-logs/${id}`, method: 'GET' })
  },
  loginLogs(params?: PageQuery) {
    return list<LoginLog>('/login-logs', params)
  },
}
