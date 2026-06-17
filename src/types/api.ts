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
  avatar_url?: string
  status: Status
  totp_enabled?: boolean
  last_login_at?: string
  last_login_ip?: string
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
  module?: string
  description?: string
  group?: string
  created_at?: string
  updated_at?: string
  [key: string]: unknown
}

export interface Role {
  id: number
  name: string
  code?: string
  description?: string
  builtin?: boolean
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
  storage_prefix?: string
  status: Status
  created_at?: string
  updated_at?: string
  [key: string]: unknown
}

export interface UserDetail {
  user: AppUser
  family_count: number
  item_count: number
  media_count: number
  [key: string]: unknown
}

export interface Family {
  id: number
  name?: string
  owner_id?: number
  owner_user_id?: number
  owner?: AppUser | Record<string, unknown>
  invite_code?: string
  storage_prefix?: string
  member_count?: number
  item_count?: number
  status?: Status
  created_at?: string
  updated_at?: string
  [key: string]: unknown
}

export interface FamilyDetail {
  family: Family
  member_count: number
  item_count: number
  [key: string]: unknown
}

export interface FamilyMember {
  id?: number
  family_id?: number
  user_id?: number
  user?: AppUser | Record<string, unknown>
  nickname?: string
  role?: string
  remark_name?: string
  joined_at?: string
  created_at?: string
  [key: string]: unknown
}

export interface ItemRecord {
  id: number
  name?: string
  title?: string
  description?: string
  quantity?: number
  min_quantity?: number | null
  low_stock?: boolean
  unit?: string
  family_id?: number
  user_id?: number
  category_id?: number
  category?: unknown
  status?: Status
  location?: string
  barcode?: string
  expires_at?: string | null
  long_term?: boolean
  is_expired?: boolean
  expires_in_seconds?: number
  media?: MediaRecord[]
  created_at?: string
  updated_at?: string
  deleted_at?: string
  [key: string]: unknown
}

export interface MediaRecord {
  id: number
  item_id?: number
  user_id?: number
  family_id?: number
  type?: 'image' | 'video' | string
  url?: string
  thumbnail_url?: string
  object_name?: string
  object_key?: string
  content_type?: string
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
  download_url?: string
  object_name?: string
  size?: number
  sha256?: string
  content_type?: string
  created_by_admin_id?: number
  updated_by_admin_id?: number
  published_by_admin_id?: number
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
  entity_type?: string
  entity_id?: number
  read_at?: string | null
  created_at?: string
  [key: string]: unknown
}

export interface CreateNotificationResult {
  created: number
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
  account?: string
  ip?: string
  user_agent?: string
  success?: boolean
  failure_reason?: string
  created_at?: string
  [key: string]: unknown
}

export interface HealthData {
  status?: string
  database?: string
  storage?: string
  mysql?: string
  redis?: string
  version?: string
  uptime?: number
  checked_at?: string
  [key: string]: unknown
}

export interface DashboardData {
  summary?: {
    users?: number
    families?: number
    items?: number
    media?: number
    app_releases?: number
    notifications?: number
    [key: string]: unknown
  }
  today?: {
    new_users?: number
    new_items?: number
    [key: string]: unknown
  }
  pending_tasks?: number
  users_total?: number
  families_total?: number
  items_total?: number
  media_total?: number
  today_active_users?: number
  pending_releases?: number
  [key: string]: unknown
}
