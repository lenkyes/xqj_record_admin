<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { Activity, ArrowRight, Boxes, Database, KeyRound, ShieldCheck, Sparkles, Users } from '@lucide/vue'
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
    <section class="login-hero" aria-label="小晴记后台概览">
      <div class="login-hero-shell">
        <header class="login-brand">
          <div class="brand-mark large">晴</div>
          <div>
            <span>小晴记 Admin</span>
            <h1>家庭记录系统管理台</h1>
          </div>
        </header>

        <div class="hero-console" aria-hidden="true">
          <div class="console-topbar">
            <div>
              <span>Operation Center</span>
              <strong>今日后台态势</strong>
            </div>
            <em><Activity :size="15" /> Live</em>
          </div>

          <div class="console-main">
            <div class="console-meter">
              <span>98%</span>
              <small>Health</small>
            </div>
            <div class="console-copy">
              <strong>服务状态稳定</strong>
              <span>Dashboard / Audit / RBAC</span>
            </div>
          </div>

          <div class="console-grid">
            <div class="console-tile strong">
              <Users :size="20" />
              <span>用户与家庭</span>
              <strong>Users</strong>
            </div>
            <div class="console-tile">
              <Boxes :size="20" />
              <span>物品媒体</span>
              <strong>Items</strong>
            </div>
            <div class="console-tile">
              <Database :size="20" />
              <span>系统健康</span>
              <strong>Health</strong>
            </div>
          </div>

          <div class="console-bars">
            <i style="--size: 42%"></i>
            <i style="--size: 68%"></i>
            <i style="--size: 53%"></i>
            <i style="--size: 84%"></i>
            <i style="--size: 61%"></i>
          </div>
        </div>

        <div class="hero-chips" aria-hidden="true">
          <span><Sparkles :size="15" /> Dashboard</span>
          <span><ShieldCheck :size="15" /> Audit</span>
          <span><Database :size="15" /> API</span>
        </div>
      </div>
    </section>

    <section class="login-panel" aria-label="管理员登录">
      <div class="login-card">
        <div class="login-title">
          <span class="login-title-icon">
            <KeyRound :size="22" />
          </span>
          <div>
            <span>Secure sign in</span>
            <h2>管理员登录</h2>
            <p>使用后台独立管理员账号进入控制台</p>
          </div>
        </div>

        <el-form class="login-form" ref="formRef" :model="form" :rules="rules" label-position="top" @keyup.enter="submit">
          <el-form-item label="账号" prop="account">
            <el-input v-model="form.account" size="large" placeholder="admin / email" clearable>
              <template #prefix>
                <Users :size="17" />
              </template>
            </el-input>
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input v-model="form.password" size="large" type="password" placeholder="请输入密码" show-password>
              <template #prefix>
                <ShieldCheck :size="17" />
              </template>
            </el-input>
          </el-form-item>
          <el-button class="login-submit" type="primary" size="large" :loading="loading" @click="submit">
            进入管理台
            <ArrowRight :size="18" />
          </el-button>
        </el-form>

        <div class="login-meta">
          <span><ShieldCheck :size="15" /> Bearer token</span>
          <strong>/api/v1/admin</strong>
        </div>
      </div>
    </section>
  </main>
</template>
