<script setup lang="ts">
import { reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { BellPlus, RefreshCw } from '@lucide/vue'
import { notificationsApi } from '@/api/admin'
import PageHeader from '@/components/PageHeader.vue'
import { usePagedList } from '@/composables/usePagedList'
import type { NotificationRecord } from '@/types/api'
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
} = usePagedList<NotificationRecord, { scope: string; type: string }>(notificationsApi.list, {
  scope: '',
  type: '',
})

const form = reactive({
  scope: 'all',
  user_id: undefined as number | undefined,
  family_id: undefined as number | undefined,
  type: 'admin_broadcast',
  title: '',
  body: '',
})

async function createNotification() {
  await notificationsApi.create(form)
  ElMessage.success('通知已创建')
  form.title = ''
  form.body = ''
  load()
}
</script>

<template>
  <div class="page-flow">
    <PageHeader title="通知中心" description="创建面向用户、家庭或全体用户的后台通知。" permission="notifications.read">
      <template #actions>
        <el-button :icon="RefreshCw" @click="load">刷新</el-button>
      </template>
    </PageHeader>

    <section class="split-panel">
      <article class="compose-panel">
        <div class="panel-heading">
          <div>
            <span>Compose</span>
            <h3>创建通知</h3>
          </div>
          <BellPlus :size="22" />
        </div>
        <el-form label-position="top">
          <el-form-item label="范围">
            <el-segmented
              v-model="form.scope"
              :options="[
                { label: '全体', value: 'all' },
                { label: '用户', value: 'user' },
                { label: '家庭', value: 'family' },
              ]"
            />
          </el-form-item>
          <el-form-item v-if="form.scope === 'user'" label="用户 ID">
            <el-input-number v-model="form.user_id" :min="1" controls-position="right" />
          </el-form-item>
          <el-form-item v-if="form.scope === 'family'" label="家庭 ID">
            <el-input-number v-model="form.family_id" :min="1" controls-position="right" />
          </el-form-item>
          <el-form-item label="类型"><el-input v-model="form.type" /></el-form-item>
          <el-form-item label="标题"><el-input v-model="form.title" /></el-form-item>
          <el-form-item label="内容"><el-input v-model="form.body" type="textarea" :rows="5" /></el-form-item>
          <el-button type="primary" @click="createNotification">发送通知</el-button>
        </el-form>
      </article>

      <article class="table-panel compact">
        <div class="table-toolbar">
          <el-select v-model="filters.scope" class="toolbar-select" placeholder="范围" clearable>
            <el-option label="全体" value="all" />
            <el-option label="用户" value="user" />
            <el-option label="家庭" value="family" />
          </el-select>
          <el-input v-model="filters.type" class="toolbar-select" placeholder="类型" clearable />
          <el-button type="primary" @click="search">筛选</el-button>
          <el-button @click="reset">重置</el-button>
        </div>

        <el-table v-loading="loading" :data="items" stripe class="data-table">
          <el-table-column label="通知">
            <template #default="{ row }">
              <div class="stacked-cell">
                <strong>{{ row.title || `通知 #${row.id}` }}</strong>
                <span>{{ row.body || '-' }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="scope" label="范围" width="90" />
          <el-table-column prop="type" label="类型" width="150" />
          <el-table-column label="创建时间" width="170">
            <template #default="{ row }">{{ formatDateTime(row.created_at) }}</template>
          </el-table-column>
        </el-table>
        <div class="pagination-row">
          <el-pagination
            v-model:current-page="page"
            v-model:page-size="pageSize"
            small
            background
            layout="total, prev, pager, next"
            :total="total"
            @size-change="onSizeChange"
            @current-change="onPageChange"
          />
        </div>
      </article>
    </section>
  </div>
</template>
