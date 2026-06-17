<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { RefreshCw, Search } from '@lucide/vue'
import { mediaApi } from '@/api/admin'
import JsonDrawer from '@/components/JsonDrawer.vue'
import PageHeader from '@/components/PageHeader.vue'
import { usePagedList } from '@/composables/usePagedList'
import type { MediaRecord } from '@/types/api'
import { formatBytes, formatDateTime, getField } from '@/utils/format'

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
} = usePagedList<MediaRecord, { type: string; item_id: string; user_id: string }>(mediaApi.list, {
  type: '',
  item_id: '',
  user_id: '',
})

const current = ref<MediaRecord | null>(null)
const drawerVisible = ref(false)

function openDetail(row: MediaRecord) {
  current.value = row
  drawerVisible.value = true
}

async function remove(row: MediaRecord) {
  await ElMessageBox.confirm(`确认删除媒体 #${row.id}？后端会同时尝试删除 MinIO 对象。`, '删除媒体', {
    type: 'warning',
    confirmButtonText: '删除',
    cancelButtonText: '取消',
  })
  await mediaApi.remove(row.id)
  ElMessage.success('媒体已删除')
  load()
}
</script>

<template>
  <div class="page-flow">
    <PageHeader title="媒体库" description="查看媒体记录与对象信息，可触发后端删除媒体记录和对象存储文件。" permission="media.read">
      <template #actions>
        <el-button :icon="RefreshCw" @click="load">刷新</el-button>
      </template>
    </PageHeader>

    <section class="table-panel">
      <div class="table-toolbar">
        <el-select v-model="filters.type" class="toolbar-select" placeholder="类型" clearable>
          <el-option label="图片" value="image" />
          <el-option label="视频" value="video" />
        </el-select>
        <el-input v-model="filters.item_id" class="toolbar-select" placeholder="物品 ID" clearable />
        <el-input v-model="filters.user_id" class="toolbar-select" placeholder="用户 ID" clearable>
          <template #prefix><Search :size="16" /></template>
        </el-input>
        <el-button type="primary" @click="search">筛选</el-button>
        <el-button @click="reset">重置</el-button>
      </div>

      <el-table v-loading="loading" :data="items" stripe class="data-table">
        <el-table-column prop="id" label="ID" width="90" />
        <el-table-column label="预览" width="120">
          <template #default="{ row }">
            <el-image
              v-if="row.thumbnail_url || row.url"
              class="media-thumb"
              :src="row.thumbnail_url || row.url"
              fit="cover"
              :preview-src-list="row.url ? [row.url] : []"
              preview-teleported
            />
            <div v-else class="media-thumb empty">FILE</div>
          </template>
        </el-table-column>
        <el-table-column label="对象">
          <template #default="{ row }">
            <div class="stacked-cell">
              <strong>{{ getField(row, ['object_name', 'object_key', 'url'], `媒体 #${row.id}`) }}</strong>
              <span>{{ getField(row, ['content_type', 'mime_type', 'type'], '-') }} · {{ formatBytes(row.size) }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="类型" width="100" />
        <el-table-column prop="item_id" label="物品 ID" width="110" />
        <el-table-column prop="user_id" label="用户 ID" width="110" />
        <el-table-column label="创建时间" width="180">
          <template #default="{ row }">{{ formatDateTime(row.created_at) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="170" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="openDetail(row)">详情</el-button>
            <el-button link type="danger" @click="remove(row)">删除</el-button>
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

    <JsonDrawer v-model="drawerVisible" title="媒体详情" :data="current" />
  </div>
</template>
