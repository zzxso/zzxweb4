<template>
  <div class="login-view">
    <div class="login-bg">
      <div class="login-glow glow-1"></div>
      <div class="login-glow glow-2"></div>
    </div>
    <div class="login-container">
      <div class="login-card glass-strong">
        <div class="login-header">
          <div class="login-logo">
            <span class="logo-dot"></span>
          </div>
          <h1 class="login-title gradient-text">Admin Login</h1>
          <p class="login-subtitle">管理员登录</p>
        </div>
        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          @submit.prevent="handleLogin"
          class="login-form"
        >
          <el-form-item prop="email">
            <el-input
              v-model="form.email"
              placeholder="请输入邮箱"
              size="large"
              prefix-icon="Message"
            />
          </el-form-item>
          <el-form-item prop="password">
            <el-input
              v-model="form.password"
              type="password"
              placeholder="请输入密码"
              size="large"
              prefix-icon="Lock"
              show-password
              @keyup.enter="handleLogin"
            />
          </el-form-item>
          <el-button
            type="primary"
            size="large"
            :loading="loading"
            class="login-btn"
            @click="handleLogin"
          >
            {{ loading ? '登录中...' : '登 录' }}
          </el-button>
        </el-form>
        <div class="login-footer">
          <router-link to="/" class="back-link">
            <el-icon><ArrowLeft /></el-icon>
            返回首页
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()
const formRef = ref(null)
const loading = ref(false)

const form = reactive({
  email: '',
  password: '',
})

const rules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入有效邮箱', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少6位', trigger: 'blur' },
  ],
}

const handleLogin = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  loading.value = true
  const result = await userStore.login(form.email, form.password)
  loading.value = false

  if (result.success) {
    ElMessage.success('登录成功')
    router.push('/admin/profile')
  } else {
    ElMessage.error(result.error || '登录失败，请检查账号密码')
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/styles/global.scss';
.login-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.login-bg {
  position: absolute;
  inset: 0;
  background: $color-bg-primary;

  .login-glow {
    position: absolute;
    border-radius: 50%;
    filter: blur(100px);
    opacity: 0.3;

    &.glow-1 {
      width: 400px;
      height: 400px;
      background: #4f46e5;
      top: -100px;
      right: -100px;
    }

    &.glow-2 {
      width: 300px;
      height: 300px;
      background: #06b6d4;
      bottom: -50px;
      left: -50px;
    }
  }
}

.login-container {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 420px;
  padding: 20px;
}

.login-card {
  padding: 32px !important;

  .login-header {
    margin-bottom: 24px;

    .login-logo .logo-dot {
      width: 14px;
      height: 14px;
    }

    .login-title {
      font-size: 1.5rem;
    }
  }

  .login-form .login-btn {
    height: 44px;
    font-size: 0.95rem;
  }
}

// Mobile
@media (max-width: 768px) {
  .login-container {
    padding: 16px;
  }

  .login-card {
    padding: 24px !important;

    .login-header {
      margin-bottom: 20px;

      .login-logo .logo-dot {
        width: 12px;
        height: 12px;
      }

      .login-title {
        font-size: 1.3rem;
      }

      .login-subtitle {
        font-size: 0.85rem;
      }
    }

    .login-form .login-btn {
      height: 42px;
    }
  }

  .login-bg .login-glow.glow-1 {
    width: 200px;
    height: 200px;
  }

  .login-bg .login-glow.glow-2 {
    width: 150px;
    height: 150px;
  }
}

// Small mobile
@media (max-width: 480px) {
  .login-container {
    padding: 12px;
  }

  .login-card {
    padding: 20px 16px !important;

    .login-title {
      font-size: 1.2rem;
    }
  }
}

@keyframes pulse {
  0%, 100% {
    box-shadow: 0 0 12px rgba(79, 70, 229, 0.4);
  }
  50% {
    box-shadow: 0 0 30px rgba(79, 70, 229, 0.8);
  }
}
</style>
