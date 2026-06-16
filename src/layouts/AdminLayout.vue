<template>
  <div class="admin-layout">
    <!-- Overlay for mobile sidebar -->
    <div class="sidebar-overlay mobile-only" :class="{ 'overlay-visible': sidebarOpen }" @click="sidebarOpen = false" />

    <div class="admin-sidebar" :class="{ 'sidebar-open': sidebarOpen }">
      <div class="sidebar-header">
        <span class="logo-dot"></span>
        <span class="gradient-text sidebar-title">Admin</span>
      </div>
      <el-menu
        :default-active="activeMenu"
        router
        class="sidebar-menu"
        @select="sidebarOpen = false"
      >
        <el-menu-item index="/admin/profile">
          <el-icon><User /></el-icon>
          <span>个人资料</span>
        </el-menu-item>
        <el-menu-item index="/admin/projects">
          <el-icon><Folder /></el-icon>
          <span>项目管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/resources">
          <el-icon><Document /></el-icon>
          <span>资源管理</span>
        </el-menu-item>
      </el-menu>
      <div class="sidebar-footer">
        <router-link to="/" class="front-link">
          <el-icon><View /></el-icon>
          <span>查看前台</span>
        </router-link>
        <el-button text @click="handleLogout" class="logout-btn">
          <el-icon><SwitchButton /></el-icon>
          <span>退出登录</span>
        </el-button>
      </div>
    </div>

    <div class="admin-main">
      <header class="admin-header glass-card">
        <div class="header-breadcrumb flex-between">
          <div class="header-left">
            <button class="sidebar-toggle mobile-only" @click="sidebarOpen = true">
              <el-icon><Operation /></el-icon>
            </button>
            <h2 class="header-title">{{ currentTitle }}</h2>
          </div>
          <div class="header-actions">
            <el-tag effect="dark" round>
              <el-icon><Lock /></el-icon>
              管理员模式
            </el-tag>
          </div>
        </div>
      </header>
      <main class="admin-content">
        <router-view v-slot="{ Component }">
          <transition name="fade-slide" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const sidebarOpen = ref(false)

const activeMenu = computed(() => {
  const path = route.path
  if (path.includes('/projects')) return '/admin/projects'
  if (path.includes('/resources')) return '/admin/resources'
  return '/admin/profile'
})

const currentTitle = computed(() => {
  const titles = {
    '/admin/profile': '个人资料',
    '/admin/projects': '项目管理',
    '/admin/resources': '资源管理',
  }
  return titles[route.path] || '管理后台'
})

const handleLogout = async () => {
  await userStore.logout()
  ElMessage.success('已退出登录')
  router.push('/admin/login')
}
</script>

<style lang="scss" scoped>
@import '@/assets/styles/global.scss';
.admin-layout {
  display: flex;
  min-height: 100vh;
  background: $color-bg-primary;
}

.admin-sidebar {
  width: 240px;
  min-height: 100vh;
  background: rgba(17, 24, 39, 0.9);
  border-right: 1px solid rgba(255, 255, 255, 0.06);
  display: flex;
  flex-direction: column;
  padding: 20px 0;
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  z-index: 200;
  transform: translateX(-100%);
  transition: transform 0.3s ease;

  &.sidebar-open {
    transform: translateX(0);
  }

  .sidebar-header {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 0 20px 30px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    margin-bottom: 20px;

    .logo-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: #818cf8;
      box-shadow: 0 0 12px rgba(79, 70, 229, 0.6);
    }

    .sidebar-title {
      font-size: 1.3rem;
      font-weight: 700;
    }
  }

  .sidebar-menu {
    flex: 1;
    border: none;
    background: transparent;

    .el-menu-item {
      margin: 4px 12px;
      border-radius: 8px;
      height: 44px;
      line-height: 44px;
      color: #94a3b8 !important;

      &:hover {
        background: rgba(79, 70, 229, 0.1) !important;
        color: #f1f5f9 !important;
      }

      &.is-active {
        background: rgba(79, 70, 229, 0.15) !important;
        color: #818cf8 !important;
      }
    }
  }

  .sidebar-footer {
    padding: 20px;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
    display: flex;
    flex-direction: column;
    gap: 8px;

    .front-link {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      border-radius: 8px;
      color: #94a3b8;
      font-size: 0.9rem;
      transition: all 0.3s ease;

      &:hover {
        background: rgba(16, 185, 129, 0.1);
        color: #10b981;
      }
    }

    .logout-btn {
      color: #ef4444;
      font-size: 0.9rem;
      padding: 8px 12px;
      border-radius: 8px;
      transition: all 0.3s ease;

      &:hover {
        background: rgba(239, 68, 68, 0.1);
      }
    }
  }
}

.sidebar-overlay {
  position: fixed;
  inset: 0;
  z-index: 199;
  background: rgba(0, 0, 0, 0.5);
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;

  &.overlay-visible {
    opacity: 1;
    visibility: visible;
  }
}

.sidebar-toggle {
  display: none;
  background: none;
  border: none;
  color: #cbd5e1;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 4px;
  margin-right: 12px;

  &:hover {
    color: #818cf8;
  }
}

.admin-main {
  flex: 1;
  margin-left: 240px;
  display: flex;
  flex-direction: column;
}

.admin-header {
  display: block;
  padding: 16px 32px !important;
  margin: 20px 20px 0;
  position: sticky;
  top: 0;
  z-index: 10;

  .header-left {
    display: flex;
    align-items: center;
  }

  .header-title {
    font-size: 1.2rem;
    font-weight: 600;
    margin: 0;
  }

  .header-actions {
    margin-top: 12px;
  }
}

.admin-content {
  flex: 1;
  padding: 20px;
  margin: 0 20px 20px;
}

// Tablet: desktop sidebar but smaller header padding
@media (min-width: 769px) {
  .admin-sidebar {
    transform: translateX(0);
  }

  .admin-header {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .header-actions {
      margin-top: 0;
    }
  }

  .sidebar-toggle {
    display: none !important;
  }

  .sidebar-overlay {
    display: none;
  }
}

// Mobile: sidebar is hidden by default
@media (max-width: 768px) {
  .admin-main {
    margin-left: 0;
  }

  .admin-header {
    padding: 12px 16px !important;
    margin: 12px 12px 0;

    .header-title {
      font-size: 1rem;
    }

    .header-actions el-tag {
      font-size: 0.75rem;
    }
  }

  .admin-content {
    padding: 16px;
    margin: 0 12px 12px;
  }
}

// Small mobile
@media (max-width: 480px) {
  .admin-header {
    padding: 10px 12px !important;
    margin: 10px 8px 0;

    .header-title {
      font-size: 0.95rem;
    }
  }

  .admin-content {
    padding: 12px;
    margin: 0 8px 8px;
  }
}
</style>
