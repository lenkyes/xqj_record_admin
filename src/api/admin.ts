import { requestData, normalizePage } from './http'
import type {
  AdminProfile,
  AppRelease,
  AppUser,
  DashboardData,
  Family,
  FamilyDetail,
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
  UserDetail,
  CreateNotificationResult,
} from '@/types/api'

function list<T>(url: string, params?: PageQuery) {
  return requestData<PageResult<T> | T[]>({ url, method: 'GET', params: cleanParams(params) }).then(normalizePage<T>)
}

function arrayList<T>(url: string, params?: PageQuery) {
  return requestData<T[]>({ url, method: 'GET', params: cleanParams(params) }).then((items) =>
    normalizePage<T>({
      items: items || [],
      total: items?.length || 0,
      page: 1,
      page_size: items?.length || 20,
    }),
  )
}

function cleanParams(params?: PageQuery | Record<string, unknown>) {
  if (!params) return undefined
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== '' && value !== undefined && value !== null),
  )
}

const RELEASE_UPLOAD_TIMEOUT = 5 * 60 * 1000
const RELEASE_ACTION_TIMEOUT = 60 * 1000

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
    return requestData<{ changed: boolean }>({ url: '/me/password', method: 'PATCH', data })
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
  permissions(params?: { module?: string }) {
    return requestData<Permission[]>({ url: '/permissions', method: 'GET', params })
  },
  roles(params?: PageQuery) {
    return arrayList<Role>('/roles', params)
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
  create(data: Partial<AdminProfile> & { password?: string; role_codes?: string[] }) {
    return requestData<AdminProfile>({ url: '/admins', method: 'POST', data })
  },
  update(id: number, data: Partial<AdminProfile>) {
    return requestData<AdminProfile>({ url: `/admins/${id}`, method: 'PATCH', data })
  },
  setRoles(id: number, role_codes: string[]) {
    return requestData<AdminProfile>({ url: `/admins/${id}/roles`, method: 'POST', data: { role_codes } })
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
    return requestData<UserDetail>({ url: `/users/${id}`, method: 'GET' })
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
    return requestData<FamilyDetail>({ url: `/families/${id}`, method: 'GET' })
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
    const { page_size, page, ...rest } = params || {}
    const limit = Number(rest.limit || page_size || 50)
    return requestData<AppRelease[]>({
      url: '/app/releases',
      method: 'GET',
      params: cleanParams({ ...rest, limit }),
    }).then((items) => ({
      items: items || [],
      total: items?.length || 0,
      page: Number(page || 1),
      page_size: limit,
    }))
  },
  detail(id: number) {
    return requestData<AppRelease>({ url: `/app/releases/${id}`, method: 'GET' })
  },
  create(data: FormData | Partial<AppRelease>) {
    return requestData<AppRelease>({ url: '/app/releases', method: 'POST', data, timeout: RELEASE_UPLOAD_TIMEOUT })
  },
  update(id: number, data: Partial<AppRelease> & { clear_title?: boolean; clear_release_notes?: boolean }) {
    return requestData<AppRelease>({
      url: `/app/releases/${id}`,
      method: 'PATCH',
      data,
    })
  },
  publish(id: number) {
    return requestData<AppRelease>({ url: `/app/releases/${id}/publish`, method: 'POST', timeout: RELEASE_ACTION_TIMEOUT })
  },
  unpublish(id: number) {
    return requestData<AppRelease>({
      url: `/app/releases/${id}/unpublish`,
      method: 'POST',
      timeout: RELEASE_ACTION_TIMEOUT,
    })
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
    return requestData<CreateNotificationResult>({ url: '/notifications', method: 'POST', data })
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
