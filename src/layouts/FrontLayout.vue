<template>
  <div class="front-layout">
    <div class="top-notice" v-if="showNotice">
      <span>本网站部署在海外平台，国内访问可能较慢，请耐心等待。</span>
      <button @click="showNotice = false">×</button>
    </div>

    <ParticleBackground />
    <nav class="main-nav glass-card" :class="{ 'nav-scrolled': scrolled, 'nav-open': mobileMenuOpen }">
      <div class="nav-container container">
        <router-link to="/" class="nav-logo">
          <span class="logo-dot"></span>
          <span class="gradient-text">ZZX</span>
        </router-link>

        <!-- Desktop nav links -->
        <div class="nav-links desktop-only">
          <router-link
            v-for="item in navItems"
            :key="item.path"
            :to="item.path"
            class="nav-link"
            active-class="active"
          >
            <span>{{ item.label }}</span>
            <span class="nav-indicator"></span>
          </router-link>
        </div>

        <div class="nav-actions">
          <button class="music-btn" @click="toggleMusic" :title="audioStore.isPlaying ? '暂停音乐' : '播放音乐'">
            <el-icon :size="18"><VideoPlay v-if="!audioStore.isPlaying" /></el-icon>
            <el-icon :size="18"><VideoPause v-else /></el-icon>
          </button>
          <router-link to="/admin" class="nav-admin-link">
            <el-icon><Setting /></el-icon>
          </router-link>
          <!-- Hamburger button -->
          <button class="hamburger-btn mobile-only" @click="toggleMobileMenu" aria-label="菜单">
            <span class="hamburger-line" :class="{ active: mobileMenuOpen }"></span>
            <span class="hamburger-line" :class="{ active: mobileMenuOpen }"></span>
            <span class="hamburger-line" :class="{ active: mobileMenuOpen }"></span>
          </button>
        </div>
      </div>
    </nav>

    <!-- Mobile menu overlay -->
    <div class="mobile-menu-overlay" :class="{ 'menu-visible': mobileMenuOpen }" @click="closeMobileMenu">
      <div class="mobile-menu-content" @click.stop>
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="mobile-nav-link"
          :class="{ active: route.path === item.path }"
          @click="closeMobileMenu"
        >
          {{ item.label }}
        </router-link>
      </div>
    </div>

    <main class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="fade-slide" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    <footer class="site-footer">
      <div class="container">
        <p class="footer-text">
          <span class="gradient-text">ZZX</span> &copy; {{ currentYear }} - Designed & Built with passion
        </p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import ParticleBackground from '@/components/ParticleBackground.vue'
import { useAudioStore } from '@/stores/audio'
import { VideoPlay, VideoPause } from '@element-plus/icons-vue'

const route = useRoute()
const audioStore = useAudioStore()
const scrolled = ref(false)
const mobileMenuOpen = ref(false)
const showNotice = ref(true)
const currentYear = new Date().getFullYear()

const navItems = [
  { path: '/', label: '首页' },
  { path: '/about', label: '个人介绍' },
  { path: '/projects', label: '项目' },
  { path: '/resources', label: '资源' },
]

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

const closeMobileMenu = () => {
  mobileMenuOpen.value = false
}

const toggleMusic = () => {
  audioStore.toggle()
}

const handleScroll = () => {
  scrolled.value = window.scrollY > 50
}

// Close mobile menu on route change
watch(() => route.path, closeMobileMenu)

// Lock body scroll when mobile menu is open
onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style lang="scss" scoped>
.front-layout {
  min-height: 100vh;
  position: relative;
}

.top-notice {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: rgba(30, 41, 59, 0.95);
  color: #94a3b8;
  font-size: 0.8rem;
  padding: 6px 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  backdrop-filter: blur(8px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);

  button {
    background: none;
    border: none;
    color: #64748b;
    font-size: 1.2rem;
    cursor: pointer;
    padding: 0 4px;
    line-height: 1;

    &:hover {
      color: #94a3b8;
    }
  }
}

.music-btn {
  background: none;
  border: 1px solid rgba(79, 70, 229, 0.3);
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #818cf8;
  transition: all 0.3s;

  &:hover {
    background: rgba(79, 70, 229, 0.1);
    border-color: rgba(79, 70, 229, 0.6);
  }
}

.main-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  padding: 12px 0;
  transition: all 0.3s ease;

  &.nav-scrolled {
    background: rgba(10, 14, 26, 0.85) !important;
    backdrop-filter: blur(20px) !important;
    border-bottom-color: rgba(79, 70, 229, 0.2);
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.3);
  }

  .nav-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .nav-logo {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 1.5rem;
    font-weight: 700;

    .logo-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: #818cf8;
      box-shadow: 0 0 12px rgba(79, 70, 229, 0.6);
      animation: pulse 2s ease-in-out infinite;
    }
  }

  .nav-links {
    display: flex;
    gap: 32px;
    align-items: center;
  }

  .nav-link {
    position: relative;
    color: #94a3b8;
    font-size: 0.95rem;
    font-weight: 500;
    padding: 4px 0;
    transition: all 0.3s ease;

    span:first-child {
      position: relative;
      z-index: 1;
    }

    .nav-indicator {
      position: absolute;
      bottom: -2px;
      left: 0;
      width: 0;
      height: 2px;
      background: linear-gradient(90deg, #4f46e5, #06b6d4);
      border-radius: 1px;
      transition: width 0.3s ease;
    }

    &:hover {
      color: #f1f5f9;

      .nav-indicator {
        width: 100%;
      }
    }

    &.active {
      color: #f1f5f9;

      .nav-indicator {
        width: 100%;
      }
    }
  }

  .nav-actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .nav-admin-link {
    color: #64748b;
    font-size: 1.2rem;
    padding: 6px;
    border-radius: 8px;
    transition: all 0.3s ease;

    &:hover {
      color: #818cf8;
      background: rgba(79, 70, 229, 0.1);
    }
  }
}

// Hamburger button
.hamburger-btn {
  display: none;
  flex-direction: column;
  gap: 5px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
  z-index: 110;

  .hamburger-line {
    display: block;
    width: 22px;
    height: 2px;
    background: #cbd5e1;
    border-radius: 1px;
    transition: all 0.3s ease;

    &.active {
      transform: rotate(45deg) translate(5px, 5px);
    }

    &:nth-child(2) {
      &.active {
        opacity: 0;
      }
    }

    &:nth-child(3) {
      transform: rotate(-45deg) translate(5px, -5px);
    }
  }
}

// Mobile menu overlay
.mobile-menu-overlay {
  position: fixed;
  inset: 0;
  z-index: 99;
  background: rgba(10, 14, 26, 0.92);
  backdrop-filter: blur(12px);
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;

  &.menu-visible {
    opacity: 1;
    visibility: visible;
  }

  .mobile-menu-content {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    flex-direction: column;
    gap: 24px;
    padding: 40px;
    transition: transform 0.3s ease;

    .mobile-nav-link {
      font-size: 1.4rem;
      font-weight: 600;
      color: #94a3b8;
      text-decoration: none;
      transition: all 0.3s ease;
      padding: 8px 0;

      &:hover,
      &.active {
        color: #f1f5f9;
      }
    }
  }
}

.main-content {
  position: relative;
  z-index: 1;
  min-height: 100vh;
  padding-top: 80px;
  margin-top: 30px;
}

.site-footer {
  position: relative;
  z-index: 1;
  text-align: center;
  padding: 24px 0;
  margin-top: 48px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  background: rgba(10, 14, 26, 0.6);
  backdrop-filter: blur(8px);

  .footer-text {
    color: #64748b;
    font-size: 0.85rem;
  }
}

@keyframes pulse {
  0%, 100% {
    box-shadow: 0 0 8px rgba(79, 70, 229, 0.4);
    opacity: 1;
  }
  50% {
    box-shadow: 0 0 20px rgba(79, 70, 229, 0.8);
    opacity: 0.8;
  }
}

// Tablet breakpoint
@media (max-width: 1024px) {
  .main-nav {
    .nav-links {
      gap: 20px;
    }
  }
}

// Mobile breakpoint
@media (max-width: 768px) {
  .desktop-only {
    display: none !important;
  }

  .hamburger-btn {
    display: flex;
  }

  .main-nav {
    .nav-logo {
      font-size: 1.2rem;

      .logo-dot {
        width: 8px;
        height: 8px;
      }
    }

    .nav-admin-link {
      font-size: 1rem;
      padding: 4px;
    }
  }

  .main-content {
    padding-top: 64px;
    margin-top: 28px;
  }

  .site-footer {
    padding: 16px 0;
    margin-top: 32px;

    .footer-text {
      font-size: 0.8rem;
    }
  }
}

// Small mobile
@media (max-width: 480px) {
  .main-nav {
    .nav-logo {
      font-size: 1rem;
    }

    .nav-admin-link {
      font-size: 0.9rem;
    }
  }

  .main-content {
    padding-top: 56px;
    margin-top: 26px;
  }

  .mobile-menu-overlay .mobile-menu-content {
    padding: 32px 24px;
    left: 50%;
    transform: translate(-50%, -50%);

    .mobile-nav-link {
      font-size: 1.2rem;
    }
  }
}
</style>
