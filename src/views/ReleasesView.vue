<script setup lang="ts">
import { reactive, ref } from 'vue'
import { ElMessage, ElMessageBox, type UploadFile } from 'element-plus'
import { Plus, RefreshCw } from '@lucide/vue'
import { releasesApi } from '@/api/admin'
import JsonDrawer from '@/components/JsonDrawer.vue'
import PageHeader from '@/components/PageHeader.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import { usePagedList } from '@/composables/usePagedList'
import type { AppRelease } from '@/types/api'
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
} = usePagedList<AppRelease, { platform: string; channel: string; published: string }>(releasesApi.list, {
  platform: '',
  channel: '',
  published: '',
})

const dialogVisible = ref(false)
const drawerVisible = ref(false)
const current = ref<AppRelease | null>(null)
const apkFile = ref<File | null>(null)
const saving = ref(false)
const publishingId = ref<number | null>(null)
const form = reactive({
  platform: 'android',
  channel: 'stable',
  version_name: '',
  version_code: 1,
  min_supported_version_code: 1,
  force_update: false,
  published: false,
  title: '',
  release_notes: '',
})

function openCreate() {
  current.value = null
  apkFile.value = null
  Object.assign(form, {
    platform: 'android',
    channel: 'stable',
    version_name: '',
    version_code: 1,
    min_supported_version_code: 1,
    force_update: false,
    published: false,
    title: '',
    release_notes: '',
  })
  dialogVisible.value = true
}

function openEdit(row: AppRelease) {
  current.value = row
  apkFile.value = null
  Object.assign(form, {
    platform: row.platform || 'android',
    channel: row.channel || 'stable',
    version_name: row.version_name || '',
    version_code: row.version_code || 1,
    min_supported_version_code: row.min_supported_version_code || 1,
    force_update: Boolean(row.force_update),
    published: Boolean(row.published),
    title: row.title || '',
    release_notes: row.release_notes || '',
  })
  dialogVisible.value = true
}

function openDetail(row: AppRelease) {
  current.value = row
  drawerVisible.value = true
}

function onFileChange(file: UploadFile) {
  apkFile.value = file.raw || null
}

function toFormData() {
  const data = new FormData()
  if (apkFile.value) data.append('file', apkFile.value)
  Object.entries(form).forEach(([key, value]) => {
    data.append(key, String(value))
  })
  return data
}

function isMessageBoxCancel(error: unknown) {
  return error === 'cancel' || error === 'close'
}

async function save() {
  if (saving.value) return
  if (!current.value && !apkFile.value) {
    ElMessage.warning('创建版本时请上传 APK 文件')
    return
  }

  saving.value = true
  try {
    if (current.value) await releasesApi.update(current.value.id, toFormData())
    else await releasesApi.create(toFormData())
    ElMessage.success('版本信息已保存')
    dialogVisible.value = false
    await load()
  } finally {
    saving.value = false
  }
}

async function togglePublish(row: AppRelease) {
  if (publishingId.value) return
  const action = row.published ? '下架' : '发布'
  publishingId.value = row.id
  try {
    await ElMessageBox.confirm(`确认${action}版本 ${row.version_name || row.id}？`, `${action}版本`, {
      type: row.published ? 'warning' : 'success',
      confirmButtonText: action,
      cancelButtonText: '取消',
    })
    if (row.published) await releasesApi.unpublish(row.id)
    else await releasesApi.publish(row.id)
    ElMessage.success(`已${action}`)
    await load()
  } catch (error) {
    if (!isMessageBoxCancel(error)) throw error
  } finally {
    publishingId.value = null
  }
}

async function remove(row: AppRelease) {
  await ElMessageBox.confirm(`确认删除版本 ${row.version_name || row.id}？`, '删除版本', {
    type: 'warning',
    confirmButtonText: '删除',
    cancelButtonText: '取消',
  })
  await releasesApi.remove(row.id)
  ElMessage.success('版本已删除')
  load()
}
</script>

<template>
  <div class="page-flow">
    <PageHeader title="App 发布" description="管理 Android 版本、渠道、强制更新和发布状态；上传 APK 使用 multipart 字段。" permission="app_releases.read">
      <template #actions>
        <el-button :icon="RefreshCw" :disabled="saving || Boolean(publishingId)" @click="load">刷新</el-button>
        <el-button type="primary" :icon="Plus" :disabled="saving || Boolean(publishingId)" @click="openCreate">新建版本</el-button>
      </template>
    </PageHeader>

    <section class="table-panel">
      <div class="table-toolbar">
        <el-select v-model="filters.platform" class="toolbar-select" placeholder="平台" clearable>
          <el-option label="Android" value="android" />
          <el-option label="iOS" value="ios" />
        </el-select>
        <el-select v-model="filters.channel" class="toolbar-select" placeholder="渠道" clearable>
          <el-option label="stable" value="stable" />
          <el-option label="beta" value="beta" />
        </el-select>
        <el-select v-model="filters.published" class="toolbar-select" placeholder="发布状态" clearable>
          <el-option label="已发布" value="true" />
          <el-option label="未发布" value="false" />
        </el-select>
        <el-button type="primary" @click="search">筛选</el-button>
        <el-button @click="reset">重置</el-button>
      </div>

      <el-table v-loading="loading" :data="items" stripe class="data-table">
        <el-table-column prop="id" label="ID" width="86" />
        <el-table-column label="版本">
          <template #default="{ row }">
            <div class="stacked-cell">
              <strong>{{ row.title || row.version_name || `版本 #${row.id}` }}</strong>
              <span>{{ row.platform || '-' }} / {{ row.channel || '-' }} · code {{ row.version_code || '-' }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="最低支持" width="120" prop="min_supported_version_code" />
        <el-table-column label="强制更新" width="120">
          <template #default="{ row }">
            <el-tag :type="row.force_update ? 'danger' : 'info'" round>{{ row.force_update ? '强制' : '普通' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="发布" width="110">
          <template #default="{ row }">
            <StatusBadge :status="row.published ? 'active' : 'disabled'" />
          </template>
        </el-table-column>
        <el-table-column label="更新时间" width="180">
          <template #default="{ row }">{{ formatDateTime(row.updated_at || row.created_at) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" :disabled="Boolean(publishingId)" @click="openDetail(row)">详情</el-button>
            <el-button link type="primary" :disabled="Boolean(publishingId)" @click="openEdit(row)">编辑</el-button>
            <el-button
              link
              :type="row.published ? 'warning' : 'success'"
              :loading="publishingId === row.id"
              :disabled="Boolean(publishingId)"
              @click="togglePublish(row)"
            >
              {{ row.published ? '下架' : '发布' }}
            </el-button>
            <el-button link type="danger" :disabled="Boolean(publishingId)" @click="remove(row)">删除</el-button>
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

    <el-dialog
      v-model="dialogVisible"
      v-loading="saving"
      :title="current ? '编辑版本' : '新建版本'"
      width="680px"
      element-loading-text="正在保存版本..."
      :close-on-click-modal="!saving"
      :close-on-press-escape="!saving"
      :show-close="!saving"
    >
      <el-form label-position="top" class="release-form">
        <div class="form-grid two">
          <el-form-item label="平台"><el-input v-model="form.platform" /></el-form-item>
          <el-form-item label="渠道"><el-input v-model="form.channel" /></el-form-item>
          <el-form-item label="版本名"><el-input v-model="form.version_name" placeholder="1.2.0" /></el-form-item>
          <el-form-item label="版本号"><el-input-number v-model="form.version_code" :min="1" controls-position="right" /></el-form-item>
          <el-form-item label="最低支持版本号">
            <el-input-number v-model="form.min_supported_version_code" :min="1" controls-position="right" />
          </el-form-item>
          <el-form-item label="发布状态"><el-switch v-model="form.published" active-text="发布" inactive-text="草稿" /></el-form-item>
        </div>
        <el-form-item label="标题"><el-input v-model="form.title" /></el-form-item>
        <el-form-item label="发布说明"><el-input v-model="form.release_notes" type="textarea" :rows="4" /></el-form-item>
        <el-form-item label="强制更新"><el-switch v-model="form.force_update" /></el-form-item>
        <el-form-item label="APK 文件">
          <el-upload :auto-upload="false" :disabled="saving" :limit="1" accept=".apk" :on-change="onFileChange">
            <el-button :disabled="saving">选择 APK</el-button>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button :disabled="saving" @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" :disabled="saving" @click="save">保存</el-button>
      </template>
    </el-dialog>

    <JsonDrawer v-model="drawerVisible" title="版本详情" :data="current" />
  </div>
</template>
