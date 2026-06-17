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
import { asText, formatDateTime, getField } from '@/utils/format'

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
} = usePagedList<ItemRecord, { keyword: string; user_id: string; family_id: string; status: string; item_state: string }>(
  itemsApi.list,
  {
  keyword: '',
  user_id: '',
  family_id: '',
  status: '',
  item_state: '',
},
)

const current = ref<ItemRecord | null>(null)
const drawerVisible = ref(false)
const editVisible = ref(false)
const editForm = reactive({
  name: '',
  description: '',
  quantity: 0,
  min_quantity: undefined as number | undefined,
  unit: '',
  location: '',
  barcode: '',
  expires_at: '',
  long_term: false,
  clear_expires_at: false,
  clear_min_quantity: false,
  clear_barcode: false,
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
  editForm.description = row.description || ''
  editForm.quantity = Number(row.quantity || 0)
  editForm.min_quantity = row.min_quantity === null || row.min_quantity === undefined ? undefined : Number(row.min_quantity)
  editForm.unit = row.unit || ''
  editForm.location = row.location || ''
  editForm.barcode = row.barcode || ''
  editForm.expires_at = row.expires_at || ''
  editForm.long_term = Boolean(row.long_term)
  editForm.clear_expires_at = false
  editForm.clear_min_quantity = false
  editForm.clear_barcode = false
  editForm.status = row.status || 'active'
  editVisible.value = true
}

async function saveEdit() {
  if (!current.value) return
  await itemsApi.update(current.value.id, {
    name: editForm.name,
    description: editForm.description,
    quantity: editForm.quantity,
    min_quantity: editForm.clear_min_quantity ? undefined : editForm.min_quantity,
    unit: editForm.unit,
    location: editForm.location,
    barcode: editForm.clear_barcode ? undefined : editForm.barcode,
    expires_at: editForm.clear_expires_at || editForm.long_term ? undefined : editForm.expires_at,
    long_term: editForm.long_term,
    clear_expires_at: editForm.clear_expires_at,
    clear_min_quantity: editForm.clear_min_quantity,
    clear_barcode: editForm.clear_barcode,
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
        <el-input v-model="filters.keyword" class="toolbar-input" placeholder="物品名 / 描述 / 位置 / 条码" clearable>
          <template #prefix><Search :size="16" /></template>
        </el-input>
        <el-input v-model="filters.user_id" class="toolbar-select" placeholder="用户 ID" clearable />
        <el-input v-model="filters.family_id" class="toolbar-select" placeholder="家庭 ID" clearable />
        <el-select v-model="filters.status" class="toolbar-select" placeholder="处理状态" clearable>
          <el-option label="在用" value="active" />
          <el-option label="已处理" value="handled" />
          <el-option label="已消耗" value="consumed" />
          <el-option label="已丢弃" value="discarded" />
          <el-option label="已归档" value="archived" />
          <el-option label="全部" value="all" />
        </el-select>
        <el-select v-model="filters.item_state" class="toolbar-select" placeholder="业务状态" clearable>
          <el-option label="在用" value="active" />
          <el-option label="长期" value="long_term" />
          <el-option label="短期" value="short_term" />
          <el-option label="即将到期" value="expiring" />
          <el-option label="已过期" value="expired" />
          <el-option label="低库存" value="low_stock" />
          <el-option label="已闭环" value="processed" />
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
                <span>{{ getField(row, ['description', 'location', 'barcode'], '未设置描述') }}</span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="数量" width="120">
          <template #default="{ row }">
            {{ asText(row.quantity) }} {{ row.unit || '' }}
            <el-tag v-if="row.low_stock" type="warning" size="small" round>低</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="有效期" width="180">
          <template #default="{ row }">{{ row.long_term ? '长期' : formatDateTime(row.expires_at) }}</template>
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
        <el-form-item label="描述"><el-input v-model="editForm.description" type="textarea" :rows="3" /></el-form-item>
        <div class="form-grid two">
          <el-form-item label="数量">
            <el-input-number v-model="editForm.quantity" :min="0" controls-position="right" />
          </el-form-item>
          <el-form-item label="最低库存">
            <el-input-number v-model="editForm.min_quantity" :min="0" controls-position="right" :disabled="editForm.clear_min_quantity" />
          </el-form-item>
          <el-form-item label="单位"><el-input v-model="editForm.unit" /></el-form-item>
          <el-form-item label="位置"><el-input v-model="editForm.location" /></el-form-item>
          <el-form-item label="条码"><el-input v-model="editForm.barcode" :disabled="editForm.clear_barcode" /></el-form-item>
          <el-form-item label="有效期">
            <el-input v-model="editForm.expires_at" placeholder="2026-07-04T12:00:00+08:00" :disabled="editForm.long_term || editForm.clear_expires_at" />
          </el-form-item>
        </div>
        <el-form-item label="清理选项">
          <el-checkbox v-model="editForm.long_term">长期物品</el-checkbox>
          <el-checkbox v-model="editForm.clear_expires_at">清空有效期</el-checkbox>
          <el-checkbox v-model="editForm.clear_min_quantity">清空最低库存</el-checkbox>
          <el-checkbox v-model="editForm.clear_barcode">清空条码</el-checkbox>
        </el-form-item>
        <el-form-item label="处理状态">
          <el-select v-model="editForm.status" class="full-width">
            <el-option label="在用" value="active" />
            <el-option label="已处理" value="handled" />
            <el-option label="已消耗" value="consumed" />
            <el-option label="已丢弃" value="discarded" />
            <el-option label="已归档" value="archived" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editVisible = false">取消</el-button>
        <el-button type="primary" @click="saveEdit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>
