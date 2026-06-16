<template>
  <div class="dashboard-view">
    <div class="welcome-banner glass-card">
      <h1 class="welcome-title gradient-text">欢迎回来，管理员</h1>
      <p class="welcome-desc">这是您的个人作品集管理后台，在这里您可以管理所有前台展示内容。</p>
    </div>

    <div class="stats-grid">
      <div class="stat-card glass-card card-hover">
        <div class="stat-icon icon-projects">
          <el-icon :size="28"><Folder /></el-icon>
        </div>
        <div class="stat-info">
          <span class="stat-number">{{ projectCount }}</span>
          <span class="stat-label">项目总数</span>
        </div>
      </div>
      <div class="stat-card glass-card card-hover">
        <div class="stat-icon icon-resources">
          <el-icon :size="28"><Document /></el-icon>
        </div>
        <div class="stat-info">
          <span class="stat-number">{{ resourceCount }}</span>
          <span class="stat-label">资源总数</span>
        </div>
      </div>
      <div class="stat-card glass-card card-hover">
        <div class="stat-icon icon-visitors">
          <el-icon :size="28"><View /></el-icon>
        </div>
        <div class="stat-info">
          <span class="stat-number">--</span>
          <span class="stat-label">访客统计</span>
        </div>
      </div>
    </div>

    <div class="quick-actions">
      <h3 class="section-heading">快捷操作</h3>
      <div class="action-grid">
        <router-link to="/admin/profile" class="action-card glass-card card-hover">
          <el-icon :size="24"><User /></el-icon>
          <span>编辑个人资料</span>
        </router-link>
        <router-link to="/admin/projects" class="action-card glass-card card-hover">
          <el-icon :size="24"><Plus /></el-icon>
          <span>新增项目</span>
        </router-link>
        <router-link to="/admin/resources" class="action-card glass-card card-hover">
          <el-icon :size="24"><Upload /></el-icon>
          <span>上传资源</span>
        </router-link>
        <router-link to="/" class="action-card glass-card card-hover" target="_blank">
          <el-icon :size="24"><Link /></el-icon>
          <span>访问前台</span>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getProjects, getResources } from '@/api'

const projectCount = ref(0)
const resourceCount = ref(0)

onMounted(async () => {
  try {
    const [projects, resources] = await Promise.all([
      getProjects().catch(() => []),
      getResources().catch(() => []),
    ])
    projectCount.value = projects?.length || 0
    resourceCount.value = resources?.length || 0
  } catch {
    // ignore
  }
})
</script>

<style lang="scss" scoped>
@import '@/assets/styles/global.scss';
.dashboard-view {
  .welcome-banner {
    padding: 24px !important;
    margin-bottom: 20px;

    .welcome-title {
      font-size: 1.3rem;
    }

    .welcome-desc {
      max-width: 100%;
      font-size: 0.9rem;
    }
  }

  .stats-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 16px;
    margin-bottom: 24px;
  }

  .stat-card {
    padding: 20px !important;
    gap: 12px;

    .stat-icon {
      width: 48px;
      height: 48px;
    }

    .stat-number {
      font-size: 1.5rem;
    }

    .stat-label {
      font-size: 0.8rem;
    }
  }

  .action-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 12px;

    .action-card {
      padding: 20px 12px !important;
      font-size: 0.85rem;
    }
  }
}

// Mobile
@media (max-width: 768px) {
  .dashboard-view {
    .welcome-banner {
      padding: 20px !important;
      .welcome-title { font-size: 1.2rem; }
    }

    .stats-grid {
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
    }

    .stat-card {
      padding: 16px 8px !important;
      .stat-icon { width: 40px; height: 40px; }
      .stat-number { font-size: 1.3rem; }
      .stat-label { font-size: 0.7rem; }
    }

    .action-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
    }
  }
}
</style>
