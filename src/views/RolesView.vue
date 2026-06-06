<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, RefreshCw } from '@lucide/vue'
import { rbacApi } from '@/api/admin'
import PageHeader from '@/components/PageHeader.vue'
import { usePagedList } from '@/composables/usePagedList'
import type { Permission, Role } from '@/types/api'
import { formatDateTime } from '@/utils/format'

const {
  loading,
  items,
  total,
  page,
  pageSize,
  load,
  onPageChange,
  onSizeChange,
} = usePagedList<Role>(rbacApi.roles)

const permissions = ref<Permission[]>([])
const dialogVisible = ref(false)
const current = ref<Role | null>(null)
const form = reactive({
  name: '',
  code: '',
  description: '',
  permission_codes: [] as string[],
})

const groupedPermissions = computed(() => {
  const groups = new Map<string, Permission[]>()
  permissions.value.forEach((permission) => {
    const group = permission.group || String(permission.code).split('.')[0] || 'misc'
    groups.set(group, [...(groups.get(group) || []), permission])
  })
  return Array.from(groups.entries()).map(([name, items]) => ({ name, items }))
})

function permissionCode(item: Permission | string) {
  return typeof item === 'string' ? item : String(item.code)
}

function rolePermissionCodes(role: Role) {
  return (role.permissions || []).map(permissionCode)
}

function isBuiltin(role: Role) {
  return role.code === 'super_admin' || role.name === 'super_admin'
}

function openCreate() {
  current.value = null
  Object.assign(form, {
    name: '',
    code: '',
    description: '',
    permission_codes: [],
  })
  dialogVisible.value = true
}

function openEdit(row: Role) {
  current.value = row
  Object.assign(form, {
    name: row.name || '',
    code: row.code || '',
    description: row.description || '',
    permission_codes: rolePermissionCodes(row),
  })
  dialogVisible.value = true
}

async function save() {
  if (current.value) {
    await rbacApi.updateRole(current.value.id, form)
  } else {
    await rbacApi.createRole(form)
  }
  ElMessage.success('角色已保存')
  dialogVisible.value = false
  load()
}

async function remove(row: Role) {
  await ElMessageBox.confirm(`确认删除角色 ${row.name}？`, '删除角色', {
    type: 'warning',
    confirmButtonText: '删除',
    cancelButtonText: '取消',
  })
  await rbacApi.deleteRole(row.id)
  ElMessage.success('角色已删除')
  load()
}

onMounted(async () => {
  permissions.value = await rbacApi.permissions()
})
</script>

<template>
  <div class="page-flow">
    <PageHeader title="角色权限" description="维护后台角色与权限码；内置 super_admin 不允许删除或改权限集合。" permission="rbac.read">
      <template #actions>
        <el-button :icon="RefreshCw" @click="load">刷新</el-button>
        <el-button type="primary" :icon="Plus" @click="openCreate">新建角色</el-button>
      </template>
    </PageHeader>

    <section class="table-panel">
      <el-table v-loading="loading" :data="items" stripe class="data-table">
        <el-table-column prop="id" label="ID" width="86" />
        <el-table-column label="角色">
          <template #default="{ row }">
            <div class="stacked-cell">
              <strong>{{ row.name }}</strong>
              <span>{{ row.code || '-' }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="权限">
          <template #default="{ row }">
            <div class="tag-list">
              <el-tag v-for="code in rolePermissionCodes(row).slice(0, 5)" :key="code" round>{{ code }}</el-tag>
              <el-tag v-if="rolePermissionCodes(row).length > 5" type="info" round>
                +{{ rolePermissionCodes(row).length - 5 }}
              </el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="180">
          <template #default="{ row }">{{ formatDateTime(row.created_at) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" :disabled="isBuiltin(row)" @click="openEdit(row)">编辑</el-button>
            <el-button link type="danger" :disabled="isBuiltin(row)" @click="remove(row)">删除</el-button>
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

    <el-dialog v-model="dialogVisible" :title="current ? '编辑角色' : '新建角色'" width="760px">
      <el-form label-position="top">
        <div class="form-grid two">
          <el-form-item label="名称"><el-input v-model="form.name" /></el-form-item>
          <el-form-item label="编码"><el-input v-model="form.code" placeholder="ops_admin" /></el-form-item>
        </div>
        <el-form-item label="描述"><el-input v-model="form.description" /></el-form-item>
        <el-form-item label="权限码">
          <el-checkbox-group v-model="form.permission_codes" class="permission-grid">
            <section v-for="group in groupedPermissions" :key="group.name" class="permission-group">
              <h4>{{ group.name }}</h4>
              <el-checkbox v-for="permission in group.items" :key="permission.code" :label="permission.code">
                {{ permission.code }}
              </el-checkbox>
            </section>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="save">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>
