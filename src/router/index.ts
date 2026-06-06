import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import type { PermissionCode } from '@/types/api'

declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    permission?: PermissionCode
    public?: boolean
  }
}

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue'),
    meta: { public: true, title: '登录' },
  },
  {
    path: '/',
    component: () => import('@/layouts/AdminLayout.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'dashboard',
        component: () => import('@/views/DashboardView.vue'),
        meta: { title: '控制台', permission: 'dashboard.read' },
      },
      {
        path: 'users',
        name: 'users',
        component: () => import('@/views/UsersView.vue'),
        meta: { title: '用户管理', permission: 'users.read' },
      },
      {
        path: 'families',
        name: 'families',
        component: () => import('@/views/FamiliesView.vue'),
        meta: { title: '家庭管理', permission: 'families.read' },
      },
      {
        path: 'items',
        name: 'items',
        component: () => import('@/views/ItemsView.vue'),
        meta: { title: '物品管理', permission: 'items.read' },
      },
      {
        path: 'media',
        name: 'media',
        component: () => import('@/views/MediaView.vue'),
        meta: { title: '媒体库', permission: 'media.read' },
      },
      {
        path: 'app-releases',
        name: 'app-releases',
        component: () => import('@/views/ReleasesView.vue'),
        meta: { title: 'App 发布', permission: 'app_releases.read' },
      },
      {
        path: 'notifications',
        name: 'notifications',
        component: () => import('@/views/NotificationsView.vue'),
        meta: { title: '通知中心', permission: 'notifications.read' },
      },
      {
        path: 'admins',
        name: 'admins',
        component: () => import('@/views/AdminsView.vue'),
        meta: { title: '后台管理员', permission: 'rbac.read' },
      },
      {
        path: 'roles',
        name: 'roles',
        component: () => import('@/views/RolesView.vue'),
        meta: { title: '角色权限', permission: 'rbac.read' },
      },
      {
        path: 'audit/operation-logs',
        name: 'operation-logs',
        component: () => import('@/views/OperationLogsView.vue'),
        meta: { title: '操作日志', permission: 'audit.read' },
      },
      {
        path: 'audit/login-logs',
        name: 'login-logs',
        component: () => import('@/views/LoginLogsView.vue'),
        meta: { title: '登录日志', permission: 'audit.read' },
      },
      {
        path: 'system/health',
        name: 'system-health',
        component: () => import('@/views/SystemHealthView.vue'),
        meta: { title: '系统健康', permission: 'system.read' },
      },
      {
        path: 'account',
        name: 'account',
        component: () => import('@/views/AccountView.vue'),
        meta: { title: '个人中心' },
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/dashboard',
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()
  document.title = to.meta.title ? `${to.meta.title} - 小晴记 Admin` : '小晴记 Admin'

  if (to.meta.public) {
    if (to.path === '/login' && auth.isLoggedIn) {
      return String(to.query.redirect || '/dashboard')
    }
    return true
  }

  if (!auth.isLoggedIn) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }

  try {
    await auth.hydrate()
  } catch {
    await auth.logout()
    return { path: '/login', query: { redirect: to.fullPath } }
  }

  if (!auth.can(to.meta.permission)) {
    return '/dashboard'
  }

  return true
})

export default router
