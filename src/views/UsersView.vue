<script setup lang="ts">
import { reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { RefreshCw, Search } from '@lucide/vue'
import { usersApi } from '@/api/admin'
import JsonDrawer from '@/components/JsonDrawer.vue'
import PageHeader from '@/components/PageHeader.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import { usePagedList } from '@/composables/usePagedList'
import type { AppUser } from '@/types/api'
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
} = usePagedList<AppUser, { keyword: string; status: string }>(usersApi.list, {
  keyword: '',
  status: '',
})

const drawerVisible = ref(false)
const editVisible = ref(false)
const current = ref<AppUser | null>(null)
const editForm = reactive({
  nickname: '',
  status: 'active',
})

async function openDetail(row: AppUser) {
  current.value = row
  drawerVisible.value = true
  try {
    current.value = await usersApi.detail(row.id)
  } catch {
    current.value = row
  }
}

function openEdit(row: AppUser) {
  current.value = row
  editForm.nickname = row.nickname || ''
  editForm.status = row.status || 'active'
  editVisible.value = true
}

async function saveEdit() {
  if (!current.value) return
  await usersApi.update(current.value.id, {
    nickname: editForm.nickname,
    status: editForm.status,
  })
  ElMessage.success('用户资料已更新')
  editVisible.value = false
  load()
}

async function toggleStatus(row: AppUser) {
  const disabled = row.status === 'disabled'
  await ElMessageBox.confirm(`确认${disabled ? '启用' : '禁用'}用户 #${row.id}？`, '状态变更', {
    type: disabled ? 'success' : 'warning',
    confirmButtonText: disabled ? '启用' : '禁用',
    cancelButtonText: '取消',
  })
  if (disabled) await usersApi.enable(row.id)
  else await usersApi.disable(row.id)
  ElMessage.success('状态已更新')
  load()
}
</script>

<template>
  <div class="page-flow">
    <PageHeader title="用户管理" description="管理普通 App 用户账号状态，禁用后登录与后续 token 鉴权都会被拒绝。" permission="users.read">
      <template #actions>
        <el-button :icon="RefreshCw" @click="load">刷新</el-button>
      </template>
    </PageHeader>

    <section class="table-panel">
      <div class="table-toolbar">
        <el-input v-model="filters.keyword" class="toolbar-input" placeholder="用户名 / 昵称 / 手机 / 邮箱" clearable>
          <template #prefix><Search :size="16" /></template>
        </el-input>
        <el-select v-model="filters.status" class="toolbar-select" placeholder="状态" clearable>
          <el-option label="启用" value="active" />
          <el-option label="禁用" value="disabled" />
        </el-select>
        <el-button type="primary" @click="search">筛选</el-button>
        <el-button @click="reset">重置</el-button>
      </div>

      <el-table v-loading="loading" :data="items" stripe class="data-table">
        <el-table-column prop="id" label="ID" width="88" />
        <el-table-column label="用户">
          <template #default="{ row }">
            <div class="identity-cell">
              <div class="avatar-spark">{{ (row.nickname || row.username || row.id).toString().slice(0, 1) }}</div>
              <div>
                <strong>{{ getField(row, ['nickname', 'username'], `用户 #${row.id}`) }}</strong>
                <span>{{ getField(row, ['phone', 'email'], '未绑定联系方式') }}</span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="110">
          <template #default="{ row }">
            <StatusBadge :status="row.status" />
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="180">
          <template #default="{ row }">{{ formatDateTime(row.created_at) }}</template>
        </el-table-column>
        <el-table-column label="最近更新" width="180">
          <template #default="{ row }">{{ formatDateTime(row.updated_at) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="openDetail(row)">详情</el-button>
            <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
            <el-button link :type="row.status === 'disabled' ? 'success' : 'danger'" @click="toggleStatus(row)">
              {{ row.status === 'disabled' ? '启用' : '禁用' }}
            </el-button>
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

    <JsonDrawer v-model="drawerVisible" title="用户详情" :data="current" />

    <el-dialog v-model="editVisible" title="编辑用户" width="460px">
      <el-form label-position="top">
        <el-form-item label="昵称">
          <el-input v-model="editForm.nickname" placeholder="昵称" />
        </el-form-item>
        <el-form-item label="状态">
          <el-segmented
            v-model="editForm.status"
            :options="[
              { label: '启用', value: 'active' },
              { label: '禁用', value: 'disabled' },
            ]"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editVisible = false">取消</el-button>
        <el-button type="primary" @click="saveEdit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>
