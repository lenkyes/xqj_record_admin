<script setup lang="ts">
import { reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { RefreshCw, Search } from '@lucide/vue'
import { itemsApi } from '@/api/admin'
import JsonDrawer from '@/components/JsonDrawer.vue'
import PageHeader from '@/components/PageHeader.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import { usePagedList } from '@/composables/usePagedList'
import type { ItemRecord } from '@/types/api'
import { formatDateTime, getField } from '@/utils/format'

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
} = usePagedList<ItemRecord, { keyword: string; family_id: string; status: string }>(itemsApi.list, {
  keyword: '',
  family_id: '',
  status: '',
})

const current = ref<ItemRecord | null>(null)
const drawerVisible = ref(false)
const editVisible = ref(false)
const editForm = reactive({
  name: '',
  category: '',
  location: '',
  status: '',
})

async function openDetail(row: ItemRecord) {
  drawerVisible.value = true
  current.value = row
  try {
    current.value = await itemsApi.detail(row.id)
  } catch {
    current.value = row
  }
}

function openEdit(row: ItemRecord) {
  current.value = row
  editForm.name = row.name || row.title || ''
  editForm.category = row.category || ''
  editForm.location = row.location || ''
  editForm.status = row.status || ''
  editVisible.value = true
}

async function saveEdit() {
  if (!current.value) return
  await itemsApi.update(current.value.id, {
    name: editForm.name,
    category: editForm.category,
    location: editForm.location,
    status: editForm.status,
  })
  ElMessage.success('物品已更新')
  editVisible.value = false
  load()
}

async function remove(row: ItemRecord) {
  await ElMessageBox.confirm(`确认软删除物品 #${row.id}？`, '删除物品', {
    type: 'warning',
    confirmButtonText: '删除',
    cancelButtonText: '取消',
  })
  await itemsApi.remove(row.id)
  ElMessage.success('物品已删除')
  load()
}
</script>

<template>
  <div class="page-flow">
    <PageHeader title="物品管理" description="管理家庭物品记录，删除操作会走后端软删除。" permission="items.read">
      <template #actions>
        <el-button :icon="RefreshCw" @click="load">刷新</el-button>
      </template>
    </PageHeader>

    <section class="table-panel">
      <div class="table-toolbar">
        <el-input v-model="filters.keyword" class="toolbar-input" placeholder="物品名 / 分类 / 位置" clearable>
          <template #prefix><Search :size="16" /></template>
        </el-input>
        <el-input v-model="filters.family_id" class="toolbar-select" placeholder="家庭 ID" clearable />
        <el-select v-model="filters.status" class="toolbar-select" placeholder="状态" clearable>
          <el-option label="启用" value="active" />
          <el-option label="禁用" value="disabled" />
          <el-option label="已删除" value="deleted" />
        </el-select>
        <el-button type="primary" @click="search">筛选</el-button>
        <el-button @click="reset">重置</el-button>
      </div>

      <el-table v-loading="loading" :data="items" stripe class="data-table">
        <el-table-column prop="id" label="ID" width="90" />
        <el-table-column label="物品">
          <template #default="{ row }">
            <div class="identity-cell">
              <div class="avatar-spark green">{{ getField(row, ['name', 'title'], row.id).toString().slice(0, 1) }}</div>
              <div>
                <strong>{{ getField(row, ['name', 'title'], `物品 #${row.id}`) }}</strong>
                <span>{{ getField(row, ['category', 'location'], '未设置分类') }}</span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="family_id" label="家庭 ID" width="110" />
        <el-table-column prop="user_id" label="用户 ID" width="110" />
        <el-table-column label="状态" width="110">
          <template #default="{ row }"><StatusBadge :status="row.status" /></template>
        </el-table-column>
        <el-table-column label="创建时间" width="180">
          <template #default="{ row }">{{ formatDateTime(row.created_at) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="openDetail(row)">详情</el-button>
            <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
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

    <JsonDrawer v-model="drawerVisible" title="物品详情" :data="current" />

    <el-dialog v-model="editVisible" title="编辑物品" width="520px">
      <el-form label-position="top">
        <el-form-item label="名称"><el-input v-model="editForm.name" /></el-form-item>
        <el-form-item label="分类"><el-input v-model="editForm.category" /></el-form-item>
        <el-form-item label="位置"><el-input v-model="editForm.location" /></el-form-item>
        <el-form-item label="状态"><el-input v-model="editForm.status" placeholder="active / disabled" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editVisible = false">取消</el-button>
        <el-button type="primary" @click="saveEdit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>
