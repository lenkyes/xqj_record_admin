<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterView, useRoute, useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { ChevronLeft, LogOut, Menu, RefreshCw, Search } from '@lucide/vue'
import { useAuthStore } from '@/stores/auth'
import { menuSections } from '@/router/menu'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const collapsed = ref(false)
const mobileOpen = ref(false)

const visibleSections = computed(() =>
  menuSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => auth.can(item.permission)),
    }))
    .filter((section) => section.items.length > 0),
)

const activeTitle = computed(() => String(route.meta.title || '控制台'))

async function logout() {
  await ElMessageBox.confirm('确认退出小晴记 Admin？', '退出登录', {
    type: 'warning',
    confirmButtonText: '退出',
    cancelButtonText: '取消',
  })
  await auth.logout()
  router.push('/login')
}

function go(path: string) {
  mobileOpen.value = false
  router.push(path)
}
</script>

<template>
  <div class="admin-shell" :class="{ 'is-collapsed': collapsed, 'is-mobile-open': mobileOpen }">
    <aside class="sidebar">
      <div class="brand">
        <div class="brand-mark">晴</div>
        <div class="brand-copy">
          <strong>小晴记</strong>
          <span>Admin Command</span>
        </div>
        <button class="icon-button collapse-button" type="button" @click="collapsed = !collapsed">
          <ChevronLeft :size="18" />
        </button>
      </div>

      <div class="nav-sections">
        <section v-for="section in visibleSections" :key="section.title" class="nav-section">
          <p class="nav-section-title">{{ section.title }}</p>
          <button
            v-for="item in section.items"
            :key="item.path"
            type="button"
            class="nav-item"
            :class="{ active: route.path === item.path }"
            :style="{ '--accent': item.accent }"
            @click="go(item.path)"
          >
            <component :is="item.icon" :size="18" />
            <span>{{ item.title }}</span>
          </button>
        </section>
      </div>
    </aside>

    <div class="mobile-mask" @click="mobileOpen = false" />

    <main class="workspace">
      <header class="topbar">
        <div class="topbar-left">
          <button class="icon-button mobile-menu" type="button" @click="mobileOpen = true">
            <Menu :size="19" />
          </button>
          <div>
            <span class="eyebrow">XQJ RECORD ADMIN</span>
            <h1>{{ activeTitle }}</h1>
          </div>
        </div>

        <div class="topbar-actions">
          <div class="command-search">
            <Search :size="16" />
            <span>接口前缀 /api/v1/admin</span>
          </div>
          <button class="icon-button" type="button" @click="router.go(0)">
            <RefreshCw :size="17" />
          </button>
          <div class="user-pill">
            <span>{{ auth.displayName.slice(0, 1) }}</span>
            <div>
              <strong>{{ auth.displayName }}</strong>
              <small>{{ auth.admin?.status || 'active' }}</small>
            </div>
          </div>
          <button class="icon-button danger" type="button" @click="logout">
            <LogOut :size="17" />
          </button>
        </div>
      </header>

      <RouterView />
    </main>
  </div>
</template>
