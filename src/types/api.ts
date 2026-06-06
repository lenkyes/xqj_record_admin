export type Status = 'active' | 'disabled' | string
export type PermissionCode =
  | 'dashboard.read'
  | 'users.read'
  | 'users.write'
  | 'families.read'
  | 'families.write'
  | 'items.read'
  | 'items.write'
  | 'media.read'
  | 'media.delete'
  | 'app_releases.read'
  | 'app_releases.write'
  | 'notifications.read'
  | 'notifications.write'
  | 'audit.read'
  | 'rbac.read'
  | 'rbac.write'
  | 'system.read'
  | string

export interface ApiEnvelope<T> {
  data: T
  message?: string
  request_id?: string
}

export interface PageQuery {
  page?: number
  page_size?: number
  [key: string]: unknown
}

export interface PageResult<T> {
  items: T[]
  total: number
  page: number
  page_size: number
}

export interface AdminProfile {
  id: number
  username: string
  nickname?: string
  email?: string
  status: Status
  roles?: Role[]
  permissions?: PermissionCode[]
  created_at?: string
  updated_at?: string
  [key: string]: unknown
}

export interface LoginResult {
  token: string
  token_type: string
  expires_at: string
  expires_in_seconds: number
  admin: AdminProfile
}

export interface Permission {
  id?: number
  code: PermissionCode
  name?: string
  description?: string
  group?: string
  [key: string]: unknown
}

export interface Role {
  id: number
  name: string
  code?: string
  description?: string
  permissions?: Permission[] | PermissionCode[]
  created_at?: string
  updated_at?: string
  [key: string]: unknown
}

export interface AppUser {
  id: number
  username?: string
  nickname?: string
  phone?: string
  email?: string
  avatar_url?: string
  status: Status
  created_at?: string
  updated_at?: string
  [key: string]: unknown
}

export interface Family {
  id: number
  name?: string
  owner_user_id?: number
  member_count?: number
  item_count?: number
  status?: Status
  created_at?: string
  updated_at?: string
  [key: string]: unknown
}

export interface FamilyMember {
  id?: number
  user_id?: number
  nickname?: string
  role?: string
  joined_at?: string
  [key: string]: unknown
}

export interface ItemRecord {
  id: number
  name?: string
  title?: string
  family_id?: number
  user_id?: number
  category?: string
  status?: Status
  location?: string
  created_at?: string
  updated_at?: string
  deleted_at?: string
  [key: string]: unknown
}

export interface MediaRecord {
  id: number
  item_id?: number
  family_id?: number
  url?: string
  object_key?: string
  mime_type?: string
  size?: number
  created_at?: string
  [key: string]: unknown
}

export interface AppRelease {
  id: number
  platform?: string
  channel?: string
  version_name?: string
  version_code?: number
  min_supported_version_code?: number
  force_update?: boolean
  published?: boolean
  title?: string
  release_notes?: string
  file_url?: string
  created_at?: string
  updated_at?: string
  published_at?: string
  [key: string]: unknown
}

export interface NotificationRecord {
  id: number
  scope?: 'user' | 'family' | 'all' | string
  user_id?: number
  family_id?: number
  type?: string
  title?: string
  body?: string
  created_at?: string
  [key: string]: unknown
}

export interface OperationLog {
  id?: number
  request_id?: string
  admin_user_id?: number
  action?: string
  permission?: string
  target_type?: string
  target_id?: string | number
  method?: string
  path?: string
  query?: unknown
  ip?: string
  user_agent?: string
  before_data?: unknown
  after_data?: unknown
  result?: string
  error_message?: string
  duration_ms?: number
  created_at?: string
  [key: string]: unknown
}

export interface LoginLog {
  id?: number
  admin_user_id?: number
  username?: string
  ip?: string
  user_agent?: string
  result?: string
  error_message?: string
  created_at?: string
  [key: string]: unknown
}

export interface HealthData {
  status?: string
  database?: string
  storage?: string
  version?: string
  uptime?: number
  checked_at?: string
  [key: string]: unknown
}

export interface DashboardData {
  users_total?: number
  families_total?: number
  items_total?: number
  media_total?: number
  today_active_users?: number
  pending_releases?: number
  [key: string]: unknown
}
