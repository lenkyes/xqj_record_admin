<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { init, use, type ECharts } from 'echarts/core'
import { BarChart, LineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { Activity, Boxes, Database, Image, RefreshCw, Rocket, Users, Warehouse } from '@lucide/vue'
import { dashboardApi } from '@/api/admin'
import MetricCard from '@/components/MetricCard.vue'
import PageHeader from '@/components/PageHeader.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import type { DashboardData, HealthData } from '@/types/api'
import { asText, formatDateTime } from '@/utils/format'

const loading = ref(false)
const overview = ref<DashboardData>({})
const health = ref<HealthData>({})
const chartRef = ref<HTMLElement>()
let chart: ECharts | null = null

use([BarChart, LineChart, GridComponent, TooltipComponent, CanvasRenderer])

const summary = computed(() => overview.value.summary || {})
const today = computed(() => overview.value.today || {})

const metrics = computed(() => [
  {
    title: '用户总量',
    value: summary.value.users ?? overview.value.users_total ?? '-',
    note: `今日新增 ${today.value.new_users ?? overview.value.today_active_users ?? '-'}`,
    tone: '#4aa3ff',
    icon: Users,
  },
  {
    title: '家庭空间',
    value: summary.value.families ?? overview.value.families_total ?? '-',
    note: '家庭协作单元',
    tone: '#ef7f64',
    icon: Warehouse,
  },
  {
    title: '物品记录',
    value: summary.value.items ?? overview.value.items_total ?? '-',
    note: `今日新增 ${today.value.new_items ?? '-'}`,
    tone: '#a5cd58',
    icon: Boxes,
  },
  {
    title: '媒体资源',
    value: summary.value.media ?? overview.value.media_total ?? '-',
    note: 'MinIO 对象索引',
    tone: '#d88cf0',
    icon: Image,
  },
])

const numericTrend = computed(() => {
  const values = Object.entries(summary.value)
    .filter(([, value]) => typeof value === 'number')
    .map(([name, value]) => ({ name, value: Number(value) }))

  if (values.length) return values

  return [
    { name: 'users', value: 0 },
    { name: 'families', value: 0 },
    { name: 'items', value: 0 },
    { name: 'media', value: 0 },
  ]
})

async function load() {
  loading.value = true
  try {
    const [dashboard, healthData] = await Promise.allSettled([dashboardApi.overview(), dashboardApi.health()])
    if (dashboard.status === 'fulfilled') overview.value = dashboard.value || {}
    if (healthData.status === 'fulfilled') health.value = healthData.value || {}
    renderChart()
  } finally {
    loading.value = false
  }
}

function renderChart() {
  if (!chartRef.value) return
  chart ||= init(chartRef.value)
  chart.setOption({
    color: ['#36c6a5'],
    grid: { left: 28, right: 18, top: 28, bottom: 28 },
    xAxis: {
      type: 'category',
      data: numericTrend.value.map((item) => item.name),
      axisTick: { show: false },
      axisLine: { lineStyle: { color: '#d7ddd8' } },
      axisLabel: { color: '#66736d' },
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: '#edf1ed' } },
      axisLabel: { color: '#66736d' },
    },
    series: [
      {
        type: 'bar',
        data: numericTrend.value.map((item) => item.value),
        barWidth: 24,
        itemStyle: {
          borderRadius: [7, 7, 0, 0],
        },
      },
      {
        type: 'line',
        data: numericTrend.value.map((item) => item.value),
        smooth: true,
        symbolSize: 8,
        lineStyle: { width: 3, color: '#ef7f64' },
        itemStyle: { color: '#ef7f64' },
      },
    ],
    tooltip: { trigger: 'axis' },
  })
}

function resize() {
  chart?.resize()
}

onMounted(() => {
  load()
  window.addEventListener('resize', resize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resize)
  chart?.dispose()
})
</script>

<template>
  <div class="page-flow" v-loading="loading">
    <PageHeader
      title="控制台"
      description="把用户、家庭、物品、媒体和发布状态放在一个可扫描的面板里。"
      permission="dashboard.read"
    >
      <template #actions>
        <el-button type="primary" :icon="RefreshCw" @click="load">刷新</el-button>
      </template>
    </PageHeader>

    <section class="metric-grid">
      <MetricCard v-for="item in metrics" :key="item.title" v-bind="item" />
    </section>

    <section class="dashboard-grid">
      <article class="panel wide">
        <div class="panel-heading">
          <div>
            <span>Live Shape</span>
            <h3>业务数据横截面</h3>
          </div>
          <Rocket :size="22" />
        </div>
        <div ref="chartRef" class="chart-surface" />
      </article>

      <article class="panel system-radar">
        <div class="panel-heading">
          <div>
            <span>System</span>
            <h3>健康状态</h3>
          </div>
          <Activity :size="22" />
        </div>
        <div class="health-stack">
          <div class="health-row">
            <span>服务</span>
            <StatusBadge :status="health.status || 'ok'" />
          </div>
          <div class="health-row">
            <span>MySQL</span>
            <StatusBadge :status="health.mysql || health.database || 'unknown'" />
          </div>
          <div class="health-row">
            <span>Redis</span>
            <StatusBadge :status="health.redis || health.storage || 'unknown'" />
          </div>
          <div class="health-row">
            <span>待处理任务</span>
            <strong>{{ asText(overview.pending_tasks ?? overview.pending_releases) }}</strong>
          </div>
          <div class="health-row">
            <span>检查时间</span>
            <strong>{{ formatDateTime(health.checked_at) }}</strong>
          </div>
        </div>
      </article>
    </section>

    <section class="ops-strip">
      <div>
        <Database :size="20" />
        <span>管理员账号独立于 App 用户</span>
      </div>
      <div>
        <Rocket :size="20" />
        <span>版本发布走 /app/releases</span>
      </div>
      <div>
        <Activity :size="20" />
        <span>受保护接口写入操作审计</span>
      </div>
    </section>
  </div>
</template>
