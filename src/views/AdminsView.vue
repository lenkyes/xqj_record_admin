<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, RefreshCw, Search } from '@lucide/vue'
import { adminsApi, rbacApi } from '@/api/admin'
import PageHeader from '@/components/PageHeader.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import { usePagedList } from '@/composables/usePagedList'
import type { AdminProfile, Role } from '@/types/api'
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
} = usePagedList<AdminProfile, { keyword: string; status: string }>(adminsApi.list, {
  keyword: '',
  status: '',
})

const roles = ref<Role[]>([])
const dialogVisible = ref(false)
const current = ref<AdminProfile | null>(null)
const form = reactive({
  username: '',
  email: '',
  nickname: '',
  password: '',
  status: 'active',
  role_ids: [] as number[],
})

function roleIds(admin: AdminProfile) {
  return (admin.roles || []).map((role) => role.id).filter(Boolean)
}

function openCreate() {
  current.value = null
  Object.assign(form, {
    username: '',
    email: '',
    nickname: '',
    password: '',
    status: 'active',
    role_ids: [],
  })
  dialogVisible.value = true
}

function openEdit(row: AdminProfile) {
  current.value = row
  Object.assign(form, {
    username: row.username || '',
    email: row.email || '',
    nickname: row.nickname || '',
    password: '',
    status: row.status || 'active',
    role_ids: roleIds(row),
  })
  dialogVisible.value = true
}

async function save() {
  if (current.value) {
    await adminsApi.update(current.value.id, {
      username: form.username,
      email: form.email,
      nickname: form.nickname,
      status: form.status,
    })
    await adminsApi.setRoles(current.value.id, form.role_ids)
  } else {
    await adminsApi.create(form)
  }
  ElMessage.success('管理员已保存')
  dialogVisible.value = false
  load()
}

async function toggleStatus(row: AdminProfile) {
  const disabled = row.status === 'disabled'
  await ElMessageBox.confirm(`确认${disabled ? '启用' : '禁用'}管理员 ${row.username}？`, '状态变更', {
    type: disabled ? 'success' : 'warning',
    confirmButtonText: disabled ? '启用' : '禁用',
    cancelButtonText: '取消',
  })
  if (disabled) await adminsApi.enable(row.id)
  else await adminsApi.disable(row.id)
  ElMessage.success('状态已更新')
  load()
}

onMounted(async () => {
  roles.value = (await rbacApi.roles({ page: 1, page_size: 200 })).items
})
</script>

<template>
  <div class="page-flow">
    <PageHeader title="后台管理员" description="后台管理员账号与普通 App 用户隔离，支持独立角色授权和启禁用。" permission="rbac.read">
      <template #actions>
        <el-button :icon="RefreshCw" @click="load">刷新</el-button>
        <el-button type="primary" :icon="Plus" @click="openCreate">新建管理员</el-button>
      </template>
    </PageHeader>

    <section class="table-panel">
      <div class="table-toolbar">
        <el-input v-model="filters.keyword" class="toolbar-input" placeholder="账号 / 昵称 / 邮箱" clearable>
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
        <el-table-column prop="id" label="ID" width="86" />
        <el-table-column label="管理员">
          <template #default="{ row }">
            <div class="identity-cell">
              <div class="avatar-spark">{{ (row.nickname || row.username || row.id).toString().slice(0, 1) }}</div>
              <div>
                <strong>{{ row.nickname || row.username }}</strong>
                <span>{{ row.username }} · {{ row.email || '未设置邮箱' }}</span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="角色">
          <template #default="{ row }">
            <div class="tag-list">
              <el-tag v-for="role in row.roles || []" :key="role.id" round>{{ role.name }}</el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="110">
          <template #default="{ row }"><StatusBadge :status="row.status" /></template>
        </el-table-column>
        <el-table-column label="创建时间" width="180">
          <template #default="{ row }">{{ formatDateTime(row.created_at) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
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

    <el-dialog v-model="dialogVisible" :title="current ? '编辑管理员' : '新建管理员'" width="640px">
      <el-form label-position="top">
        <div class="form-grid two">
          <el-form-item label="账号"><el-input v-model="form.username" /></el-form-item>
          <el-form-item label="邮箱"><el-input v-model="form.email" /></el-form-item>
          <el-form-item label="昵称"><el-input v-model="form.nickname" /></el-form-item>
          <el-form-item label="状态">
            <el-select v-model="form.status">
              <el-option label="启用" value="active" />
              <el-option label="禁用" value="disabled" />
            </el-select>
          </el-form-item>
        </div>
        <el-form-item v-if="!current" label="初始密码">
          <el-input v-model="form.password" type="password" show-password />
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="form.role_ids" multiple clearable class="full-width">
            <el-option v-for="role in roles" :key="role.id" :label="role.name" :value="role.id" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="save">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>
