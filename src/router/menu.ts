import type { Component } from 'vue'
import {
  Activity,
  Bell,
  Boxes,
  FileClock,
  HeartPulse,
  Home,
  Image,
  KeyRound,
  PackageSearch,
  Rocket,
  ShieldCheck,
  Users,
  Warehouse,
} from '@lucide/vue'
import type { PermissionCode } from '@/types/api'

export interface MenuItem {
  title: string
  path: string
  icon: Component
  permission?: PermissionCode
  accent: string
}

export interface MenuSection {
  title: string
  items: MenuItem[]
}

export const menuSections: MenuSection[] = [
  {
    title: '总览',
    items: [
      { title: '控制台', path: '/dashboard', icon: Home, permission: 'dashboard.read', accent: '#36c6a5' },
      { title: '系统健康', path: '/system/health', icon: HeartPulse, permission: 'system.read', accent: '#f6b44b' },
    ],
  },
  {
    title: '业务',
    items: [
      { title: '用户管理', path: '/users', icon: Users, permission: 'users.read', accent: '#4aa3ff' },
      { title: '家庭管理', path: '/families', icon: Warehouse, permission: 'families.read', accent: '#ef7f64' },
      { title: '物品管理', path: '/items', icon: Boxes, permission: 'items.read', accent: '#a5cd58' },
      { title: '媒体库', path: '/media', icon: Image, permission: 'media.read', accent: '#d88cf0' },
    ],
  },
  {
    title: '运营',
    items: [
      { title: 'App 发布', path: '/app-releases', icon: Rocket, permission: 'app_releases.read', accent: '#36c6a5' },
      { title: '通知中心', path: '/notifications', icon: Bell, permission: 'notifications.read', accent: '#f06f82' },
    ],
  },
  {
    title: '权限与审计',
    items: [
      { title: '后台管理员', path: '/admins', icon: ShieldCheck, permission: 'rbac.read', accent: '#4aa3ff' },
      { title: '角色权限', path: '/roles', icon: KeyRound, permission: 'rbac.read', accent: '#f6b44b' },
      { title: '操作日志', path: '/audit/operation-logs', icon: FileClock, permission: 'audit.read', accent: '#ef7f64' },
      { title: '登录日志', path: '/audit/login-logs', icon: Activity, permission: 'audit.read', accent: '#a5cd58' },
      { title: '个人中心', path: '/account', icon: PackageSearch, accent: '#36c6a5' },
    ],
  },
]
