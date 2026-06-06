<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Activity, Database, HardDrive, RefreshCw, Server } from '@lucide/vue'
import { dashboardApi } from '@/api/admin'
import JsonDrawer from '@/components/JsonDrawer.vue'
import MetricCard from '@/components/MetricCard.vue'
import PageHeader from '@/components/PageHeader.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import type { HealthData } from '@/types/api'
import { asText, formatDateTime } from '@/utils/format'

const loading = ref(false)
const health = ref<HealthData>({})
const drawerVisible = ref(false)

async function load() {
  loading.value = true
  try {
    health.value = await dashboardApi.health()
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<template>
  <div class="page-flow" v-loading="loading">
    <PageHeader title="系统健康" description="读取 /health，观察服务、数据库、对象存储和运行版本。" permission="system.read">
      <template #actions>
        <el-button :icon="RefreshCw" @click="load">刷新</el-button>
        <el-button @click="drawerVisible = true">原始 JSON</el-button>
      </template>
    </PageHeader>

    <section class="metric-grid">
      <MetricCard title="服务状态" :value="health.status || 'unknown'" note="admin health" tone="#36c6a5" :icon="Server" />
      <MetricCard title="数据库" :value="health.database || 'unknown'" note="primary connection" tone="#4aa3ff" :icon="Database" />
      <MetricCard title="对象存储" :value="health.storage || 'unknown'" note="MinIO/object store" tone="#ef7f64" :icon="HardDrive" />
      <MetricCard title="运行版本" :value="asText(health.version)" :note="formatDateTime(health.checked_at)" tone="#f6b44b" :icon="Activity" />
    </section>

    <section class="panel">
      <div class="panel-heading">
        <div>
          <span>Health Matrix</span>
          <h3>服务检查点</h3>
        </div>
      </div>
      <div class="health-matrix">
        <div class="health-row">
          <span>status</span>
          <StatusBadge :status="health.status || 'unknown'" />
        </div>
        <div class="health-row">
          <span>database</span>
          <StatusBadge :status="health.database || 'unknown'" />
        </div>
        <div class="health-row">
          <span>storage</span>
          <StatusBadge :status="health.storage || 'unknown'" />
        </div>
        <div class="health-row">
          <span>uptime</span>
          <strong>{{ asText(health.uptime) }}</strong>
        </div>
        <div class="health-row">
          <span>checked_at</span>
          <strong>{{ formatDateTime(health.checked_at) }}</strong>
        </div>
      </div>
    </section>

    <JsonDrawer v-model="drawerVisible" title="健康检查原始数据" :data="health" />
  </div>
</template>
