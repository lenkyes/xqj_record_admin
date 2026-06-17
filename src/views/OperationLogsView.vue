<script setup lang="ts">
import { ref } from 'vue'
import { RefreshCw, Search } from '@lucide/vue'
import { auditApi } from '@/api/admin'
import JsonDrawer from '@/components/JsonDrawer.vue'
import PageHeader from '@/components/PageHeader.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import { usePagedList } from '@/composables/usePagedList'
import type { OperationLog } from '@/types/api'
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
} = usePagedList<OperationLog, { admin_user_id: string; result: string; keyword: string }>(auditApi.operationLogs, {
  admin_user_id: '',
  result: '',
  keyword: '',
})

const current = ref<OperationLog | null>(null)
const drawerVisible = ref(false)

async function openDetail(row: OperationLog) {
  current.value = row
  drawerVisible.value = true
  const id = row.id || row.request_id
  if (!id) return
  try {
    current.value = await auditApi.operationLog(id)
  } catch {
    current.value = row
  }
}
</script>

<template>
  <div class="page-flow">
    <PageHeader title="操作日志" description="查看所有已登录后台接口写入的 admin_operation_logs。" permission="audit.read">
      <template #actions>
        <el-button :icon="RefreshCw" @click="load">刷新</el-button>
      </template>
    </PageHeader>

    <section class="table-panel">
      <div class="table-toolbar">
        <el-select v-model="filters.result" class="toolbar-select" placeholder="结果" clearable>
          <el-option label="success" value="success" />
          <el-option label="failed" value="failed" />
        </el-select>
        <el-input v-model="filters.admin_user_id" class="toolbar-select" placeholder="管理员 ID" clearable />
        <el-input v-model="filters.keyword" class="toolbar-input" placeholder="接口路径 / 目标 / 动作" clearable>
          <template #prefix><Search :size="16" /></template>
        </el-input>
        <el-button type="primary" @click="search">筛选</el-button>
        <el-button @click="reset">重置</el-button>
      </div>

      <el-table v-loading="loading" :data="items" stripe class="data-table">
        <el-table-column label="请求" min-width="260">
          <template #default="{ row }">
            <div class="stacked-cell">
              <strong>{{ row.method || '-' }} {{ row.path || '-' }}</strong>
              <span>{{ row.request_id || '-' }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="permission" label="权限" width="170" />
        <el-table-column label="目标" width="160">
          <template #default="{ row }">{{ row.target_type || '-' }} #{{ row.target_id || '-' }}</template>
        </el-table-column>
        <el-table-column label="结果" width="120">
          <template #default="{ row }"><StatusBadge :status="row.result" /></template>
        </el-table-column>
        <el-table-column label="耗时" width="100">
          <template #default="{ row }">{{ row.duration_ms ?? '-' }} ms</template>
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

    <JsonDrawer v-model="drawerVisible" title="操作日志详情" :data="current" />
  </div>
</template>
