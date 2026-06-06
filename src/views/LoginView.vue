<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { ArrowRight, Boxes, KeyRound, ShieldCheck, Sparkles, Users } from '@lucide/vue'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const formRef = ref<FormInstance>()
const loading = ref(false)

const form = reactive({
  account: '',
  password: '',
})

const rules: FormRules = {
  account: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
}

async function submit() {
  await formRef.value?.validate()
  loading.value = true
  try {
    await auth.login(form.account, form.password)
    ElMessage.success('欢迎回来')
    router.replace(String(route.query.redirect || '/dashboard'))
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="login-screen">
    <section class="login-hero">
      <div class="hero-plate">
        <div class="brand-lockup">
          <div class="brand-mark large">晴</div>
          <div>
            <span>小晴记 Admin</span>
            <h1>家庭记录系统管理台</h1>
          </div>
        </div>

        <div class="signal-board">
          <div class="signal-card strong">
            <Sparkles :size="24" />
            <strong>运营态势</strong>
            <span>Dashboard / Health</span>
          </div>
          <div class="signal-card">
            <Users :size="22" />
            <strong>用户与家庭</strong>
            <span>Users / Families</span>
          </div>
          <div class="signal-card">
            <Boxes :size="22" />
            <strong>物品媒体</strong>
            <span>Items / Media</span>
          </div>
          <div class="signal-card">
            <ShieldCheck :size="22" />
            <strong>权限审计</strong>
            <span>RBAC / Audit</span>
          </div>
        </div>
      </div>
    </section>

    <section class="login-panel">
      <div class="login-card">
        <div class="login-title">
          <KeyRound :size="24" />
          <div>
            <h2>管理员登录</h2>
            <p>使用后台独立管理员账号进入控制台</p>
          </div>
        </div>

        <el-form ref="formRef" :model="form" :rules="rules" label-position="top" @keyup.enter="submit">
          <el-form-item label="账号" prop="account">
            <el-input v-model="form.account" size="large" placeholder="admin / email" clearable />
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input v-model="form.password" size="large" type="password" placeholder="请输入密码" show-password />
          </el-form-item>
          <el-button class="login-submit" type="primary" size="large" :loading="loading" @click="submit">
            进入管理台
            <ArrowRight :size="18" />
          </el-button>
        </el-form>

        <div class="login-meta">
          <span>Authorization: Bearer token</span>
          <strong>/api/v1/admin</strong>
        </div>
      </div>
    </section>
  </main>
</template>
