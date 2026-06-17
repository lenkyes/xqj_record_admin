<script setup lang="ts">
import { ref } from 'vue'
import { RefreshCw } from '@lucide/vue'
import { auditApi } from '@/api/admin'
import JsonDrawer from '@/components/JsonDrawer.vue'
import PageHeader from '@/components/PageHeader.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import { usePagedList } from '@/composables/usePagedList'
import type { LoginLog } from '@/types/api'
import { formatDateTime } from '@/utils/format'

const {
  loading,
  items,
  total,
  page,
  pageSize,
  filters,
  load,
  search,
  reset,
  onPageChange,
  onSizeChange,
} = usePagedList<LoginLog, { success: string }>(auditApi.loginLogs, {
  success: '',
})

const current = ref<LoginLog | null>(null)
const drawerVisible = ref(false)

function openDetail(row: LoginLog) {
  current.value = row
  drawerVisible.value = true
}
</script>

<template>
  <div class="page-flow">
    <PageHeader title="登录日志" description="查看后台管理员登录尝试、来源 IP、UA 和失败原因。" permission="audit.read">
      <template #actions>
        <el-button :icon="RefreshCw" @click="load">刷新</el-button>
      </template>
    </PageHeader>

    <section class="table-panel">
      <div class="table-toolbar">
        <el-select v-model="filters.success" class="toolbar-select" placeholder="结果" clearable>
          <el-option label="成功" value="true" />
          <el-option label="失败" value="false" />
        </el-select>
        <el-button type="primary" @click="search">筛选</el-button>
        <el-button @click="reset">重置</el-button>
      </div>

      <el-table v-loading="loading" :data="items" stripe class="data-table">
        <el-table-column label="管理员" width="180">
          <template #default="{ row }">{{ row.account || row.admin_user_id || '-' }}</template>
        </el-table-column>
        <el-table-column prop="ip" label="IP" width="150" />
        <el-table-column label="结果" width="120">
          <template #default="{ row }"><StatusBadge :status="row.success ? 'success' : 'failed'" /></template>
        </el-table-column>
        <el-table-column label="User Agent">
          <template #default="{ row }">
            <span class="single-line">{{ row.user_agent || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="时间" width="180">
          <template #default="{ row }">{{ formatDateTime(row.created_at) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="110" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="openDetail(row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-row">
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="pageSize"
          background
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          @size-change="onSizeChange"
          @current-change="onPageChange"
        />
      </div>
    </section>

    <JsonDrawer v-model="drawerVisible" title="登录日志详情" :data="current" />
  </div>
</template>
