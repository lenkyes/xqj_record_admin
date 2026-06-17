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
  new_password: '',
  avatar_url: '',
  status: 'active',
  role_codes: [] as string[],
})

function roleCodes(admin: AdminProfile) {
  return (admin.roles || []).map((role) => role.code).filter(Boolean) as string[]
}

function normalizeCode(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9_.-]/g, '')
}

function openCreate() {
  current.value = null
  Object.assign(form, {
    username: '',
    email: '',
    nickname: '',
    password: '',
    new_password: '',
    avatar_url: '',
    status: 'active',
    role_codes: [],
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
    new_password: '',
    avatar_url: row.avatar_url || '',
    status: row.status || 'active',
    role_codes: roleCodes(row),
  })
  dialogVisible.value = true
}

async function save() {
  if (current.value) {
    const data: Partial<AdminProfile> & { new_password?: string } = {
      email: form.email,
      nickname: form.nickname,
      avatar_url: form.avatar_url,
      status: form.status,
    }
    if (form.new_password) data.new_password = form.new_password
    await adminsApi.update(current.value.id, data)
    await adminsApi.setRoles(current.value.id, form.role_codes)
  } else {
    await adminsApi.create({
      username: normalizeCode(form.username),
      email: form.email,
      nickname: form.nickname,
      avatar_url: form.avatar_url,
      password: form.password,
      role_codes: form.role_codes,
    })
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
          <el-form-item label="账号">
            <el-input v-model="form.username" :disabled="Boolean(current)" @input="form.username = normalizeCode(String($event))" />
          </el-form-item>
          <el-form-item label="邮箱"><el-input v-model="form.email" /></el-form-item>
          <el-form-item label="昵称"><el-input v-model="form.nickname" /></el-form-item>
          <el-form-item label="状态">
            <el-select v-model="form.status">
              <el-option label="启用" value="active" />
              <el-option label="禁用" value="disabled" />
            </el-select>
          </el-form-item>
        </div>
        <el-form-item label="头像 URL"><el-input v-model="form.avatar_url" /></el-form-item>
        <el-form-item v-if="!current" label="初始密码">
          <el-input v-model="form.password" type="password" show-password />
        </el-form-item>
        <el-form-item v-else label="重置密码">
          <el-input v-model="form.new_password" type="password" show-password placeholder="留空则不修改" />
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="form.role_codes" multiple clearable class="full-width">
            <el-option v-for="role in roles" :key="role.code || role.id" :label="role.name" :value="role.code" />
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
