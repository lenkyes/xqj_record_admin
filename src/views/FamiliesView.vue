<script setup lang="ts">
import { reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { RefreshCw, Search } from '@lucide/vue'
import { familiesApi } from '@/api/admin'
import PageHeader from '@/components/PageHeader.vue'
import { usePagedList } from '@/composables/usePagedList'
import type { Family, FamilyDetail, FamilyMember, ItemRecord } from '@/types/api'
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
} = usePagedList<Family, { keyword: string }>(familiesApi.list, {
  keyword: '',
})

const drawerVisible = ref(false)
const detailLoading = ref(false)
const current = ref<Family | null>(null)
const detail = ref<FamilyDetail | null>(null)
const members = ref<FamilyMember[]>([])
const familyItems = ref<ItemRecord[]>([])
const editForm = reactive({
  name: '',
})

async function openDetail(row: Family) {
  drawerVisible.value = true
  detailLoading.value = true
  current.value = row
  detail.value = null
  members.value = []
  familyItems.value = []
  try {
    const [familyDetail, memberPage, itemPage] = await Promise.allSettled([
      familiesApi.detail(row.id),
      familiesApi.members(row.id, { page: 1, page_size: 10 }),
      familiesApi.items(row.id, { page: 1, page_size: 10 }),
    ])
    if (familyDetail.status === 'fulfilled') {
      detail.value = familyDetail.value
      current.value = {
        ...familyDetail.value.family,
        member_count: familyDetail.value.member_count,
        item_count: familyDetail.value.item_count,
      }
    }
    if (memberPage.status === 'fulfilled') members.value = memberPage.value.items
    if (itemPage.status === 'fulfilled') familyItems.value = itemPage.value.items
    editForm.name = current.value?.name || ''
  } finally {
    detailLoading.value = false
  }
}

async function saveEdit() {
  if (!current.value) return
  current.value = await familiesApi.update(current.value.id, {
    name: editForm.name,
  })
  ElMessage.success('家庭信息已更新')
  load()
}
</script>

<template>
  <div class="page-flow">
    <PageHeader title="家庭管理" description="查看家庭空间、成员和家庭内物品，支持调整家庭基础信息。" permission="families.read">
      <template #actions>
        <el-button :icon="RefreshCw" @click="load">刷新</el-button>
      </template>
    </PageHeader>

    <section class="table-panel">
      <div class="table-toolbar">
        <el-input v-model="filters.keyword" class="toolbar-input" placeholder="家庭名 / ID / 成员关键字" clearable>
          <template #prefix><Search :size="16" /></template>
        </el-input>
        <el-button type="primary" @click="search">筛选</el-button>
        <el-button @click="reset">重置</el-button>
      </div>

      <el-table v-loading="loading" :data="items" stripe class="data-table">
        <el-table-column prop="id" label="ID" width="90" />
        <el-table-column label="家庭">
          <template #default="{ row }">
            <div class="identity-cell">
              <div class="avatar-spark warm">{{ (row.name || row.id).toString().slice(0, 1) }}</div>
              <div>
                <strong>{{ getField(row, ['name'], `家庭 #${row.id}`) }}</strong>
                <span>Owner: {{ getField(row, ['owner_id', 'owner_user_id'], '-') }}</span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="成员" width="110">
          <template #default="{ row }">{{ getField(row, ['member_count', 'members_count'], '-') }}</template>
        </el-table-column>
        <el-table-column label="物品" width="110">
          <template #default="{ row }">{{ getField(row, ['item_count', 'items_count'], '-') }}</template>
        </el-table-column>
        <el-table-column label="创建时间" width="180">
          <template #default="{ row }">{{ formatDateTime(row.created_at) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="130" fixed="right">
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

    <el-drawer v-model="drawerVisible" title="家庭详情" size="720px">
      <div v-loading="detailLoading" class="detail-stack">
        <el-descriptions v-if="current" :column="2" border>
          <el-descriptions-item label="ID">{{ current.id }}</el-descriptions-item>
          <el-descriptions-item label="名称">{{ current.name || '-' }}</el-descriptions-item>
          <el-descriptions-item label="Owner">{{ current.owner_id || current.owner_user_id || '-' }}</el-descriptions-item>
          <el-descriptions-item label="邀请码">{{ current.invite_code || '-' }}</el-descriptions-item>
          <el-descriptions-item label="成员">{{ current.member_count ?? detail?.member_count ?? '-' }}</el-descriptions-item>
          <el-descriptions-item label="物品">{{ current.item_count ?? detail?.item_count ?? '-' }}</el-descriptions-item>
          <el-descriptions-item label="存储前缀">{{ current.storage_prefix || '-' }}</el-descriptions-item>
          <el-descriptions-item label="创建">{{ formatDateTime(current.created_at) }}</el-descriptions-item>
          <el-descriptions-item label="更新">{{ formatDateTime(current.updated_at) }}</el-descriptions-item>
        </el-descriptions>

        <el-form label-position="top" class="drawer-form">
          <el-form-item label="家庭名称">
            <el-input v-model="editForm.name" />
          </el-form-item>
          <el-button type="primary" @click="saveEdit">保存基础信息</el-button>
        </el-form>

        <el-tabs>
          <el-tab-pane label="成员">
            <el-table :data="members" size="small">
              <el-table-column label="用户 ID" width="100">
                <template #default="{ row }">{{ row.user_id || row.user?.id || '-' }}</template>
              </el-table-column>
              <el-table-column label="昵称">
                <template #default="{ row }">
                  {{ row.remark_name || row.nickname || getField(row.user || {}, ['nickname', 'email', 'phone'], '-') }}
                </template>
              </el-table-column>
              <el-table-column prop="role" label="角色" width="120" />
              <el-table-column label="加入时间" width="170">
                <template #default="{ row }">{{ formatDateTime(row.created_at || row.joined_at) }}</template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
          <el-tab-pane label="物品">
            <el-table :data="familyItems" size="small">
              <el-table-column prop="id" label="ID" width="80" />
              <el-table-column label="名称">
                <template #default="{ row }">{{ getField(row, ['name', 'title'], `物品 #${row.id}`) }}</template>
              </el-table-column>
              <el-table-column label="分类" width="120">
                <template #default="{ row }">{{ asText(row.category || row.category_id) }}</template>
              </el-table-column>
              <el-table-column label="创建时间" width="170">
                <template #default="{ row }">{{ formatDateTime(row.created_at) }}</template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-drawer>
  </div>
</template>
