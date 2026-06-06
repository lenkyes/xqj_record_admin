<script setup lang="ts">
import { reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { KeyRound, RefreshCw, ShieldCheck } from '@lucide/vue'
import PageHeader from '@/components/PageHeader.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import { useAuthStore } from '@/stores/auth'
import { formatDateTime } from '@/utils/format'

const auth = useAuthStore()
const loading = ref(false)
const passwordForm = reactive({
  old_password: '',
  new_password: '',
  confirm_password: '',
})

async function refreshMe() {
  loading.value = true
  auth.bootstrapped = false
  try {
    await auth.hydrate()
    ElMessage.success('个人信息已刷新')
  } finally {
    loading.value = false
  }
}

async function changePassword() {
  if (passwordForm.new_password !== passwordForm.confirm_password) {
    ElMessage.warning('两次新密码不一致')
    return
  }
  await auth.changePassword(passwordForm.old_password, passwordForm.new_password)
  Object.assign(passwordForm, {
    old_password: '',
    new_password: '',
    confirm_password: '',
  })
  ElMessage.success('密码已更新')
}
</script>

<template>
  <div class="page-flow" v-loading="loading">
    <PageHeader title="个人中心" description="查看当前管理员身份、角色权限并修改登录密码。">
      <template #actions>
        <el-button :icon="RefreshCw" @click="refreshMe">刷新资料</el-button>
      </template>
    </PageHeader>

    <section class="split-panel">
      <article class="panel">
        <div class="panel-heading">
          <div>
            <span>Identity</span>
            <h3>当前管理员</h3>
          </div>
          <ShieldCheck :size="22" />
        </div>
        <el-descriptions v-if="auth.admin" :column="1" border>
          <el-descriptions-item label="ID">{{ auth.admin.id }}</el-descriptions-item>
          <el-descriptions-item label="账号">{{ auth.admin.username }}</el-descriptions-item>
          <el-descriptions-item label="昵称">{{ auth.admin.nickname || '-' }}</el-descriptions-item>
          <el-descriptions-item label="邮箱">{{ auth.admin.email || '-' }}</el-descriptions-item>
          <el-descriptions-item label="状态"><StatusBadge :status="auth.admin.status" /></el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ formatDateTime(auth.admin.created_at) }}</el-descriptions-item>
        </el-descriptions>
        <div class="tag-list account-tags">
          <el-tag v-for="role in auth.admin?.roles || []" :key="role.id" round>{{ role.name }}</el-tag>
          <el-tag v-for="permission in auth.admin?.permissions || []" :key="permission" type="info" round>
            {{ permission }}
          </el-tag>
        </div>
      </article>

      <article class="compose-panel">
        <div class="panel-heading">
          <div>
            <span>Security</span>
            <h3>修改密码</h3>
          </div>
          <KeyRound :size="22" />
        </div>
        <el-form label-position="top">
          <el-form-item label="旧密码">
            <el-input v-model="passwordForm.old_password" type="password" show-password />
          </el-form-item>
          <el-form-item label="新密码">
            <el-input v-model="passwordForm.new_password" type="password" show-password />
          </el-form-item>
          <el-form-item label="确认新密码">
            <el-input v-model="passwordForm.confirm_password" type="password" show-password />
          </el-form-item>
          <el-button type="primary" @click="changePassword">更新密码</el-button>
        </el-form>
      </article>
    </section>
  </div>
</template>
