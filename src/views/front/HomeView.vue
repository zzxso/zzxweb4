<template>
  <div class="home-view">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="container hero-container">
        <div class="hero-content">
          <h1 class="hero-name gradient-text">{{ profile.name }}</h1>
          <p class="hero-position">{{ profile.position }}</p>
          <p class="hero-bio">{{ profile.bio }}</p>
          <div class="hero-actions">
            <router-link to="/projects" class="btn-neon">
              <span>查看项目</span>
            </router-link>
            <router-link to="/about" class="btn-neon btn-outline">
              <span>了解更多</span>
            </router-link>
          </div>
        </div>
        <div class="hero-bg">
          <img src="/avatar-bg.png" alt="background" />
        </div>
        <div class="hero-stats">
          <div
            v-for="stat in stats"
            :key="stat.label"
            class="stat-item glass-card"
          >
            <span class="stat-number gradient-text">{{ stat.number }}</span>
            <span class="stat-label">{{ stat.label }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Featured Projects -->
    <section class="featured-section">
      <div class="container">
        <h2 class="section-title gradient-text">精选项目</h2>
        <div class="project-grid">
          <div
            v-for="project in featuredProjects"
            :key="project.id"
            class="project-card glass-card card-hover"
            @click="goToProject(project.id)"
          >
            <div class="project-cover">
              <img v-if="project.cover" :src="project.cover" alt="" />
              <div v-else class="cover-placeholder">
                <el-icon><Picture /></el-icon>
              </div>
            </div>
            <div class="project-info">
              <h3 class="project-title">{{ project.title }}</h3>
              <p class="project-desc">{{ project.description }}</p>
              <div class="project-tags">
                <el-tag
                  v-for="tag in project.tags?.slice(0, 3)"
                  :key="tag"
                  size="small"
                  effect="dark"
                  round
                >
                  {{ tag }}
                </el-tag>
              </div>
            </div>
          </div>
        </div>
        <div class="view-more">
          <router-link to="/projects" class="btn-neon">
            <span>查看全部项目</span>
          </router-link>
        </div>
      </div>
    </section>

    <!-- Skills -->
    <section class="skills-section">
      <div class="container">
        <h2 class="section-title gradient-text">技能专长</h2>
        <div class="skills-cloud">
          <span
            v-for="(skill, index) in profile.skills"
            :key="skill"
            class="skill-tag"
            :style="{ animationDelay: `${index * 0.1}s` }"
          >
            {{ skill }}
          </span>
        </div>
      </div>
    </section>

    <!-- Contact -->
    <section class="contact-section">
      <div class="container">
        <h2 class="section-title gradient-text">联系我</h2>
        <div class="contact-grid">
          <div
            v-for="item in filteredContact"
            :key="item.key"
            class="contact-item glass-card card-hover"
          >
            <el-icon :size="24" class="contact-icon"><component :is="getContactIcon(item.key)" /></el-icon>
            <span class="contact-label">{{ getContactLabel(item.key) }}</span>
            <span class="contact-value">{{ item.value }}</span>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getProfile, getProjects } from '@/api'
import { ElMessage } from 'element-plus'

const router = useRouter()
const profile = ref({
  name: '加载中...',
  position: '',
  bio: '',
  skills: [],
  contact: {},
})
const featuredProjects = ref([])

const stats = ref([
  { number: '5+', label: '年经验' },
  { number: '20+', label: '完成项目' },
  { number: '50+', label: '技术文章' },
])

const getContactIcon = (key) => {
  const icons = {
    email: 'Message',
    github: 'Connection',
    gitee: 'Connection',
    wechat: 'ChatDotRound',
    phone: 'Phone',
  }
  return icons[key] || 'Link'
}

const getContactLabel = (key) => {
  const labels = {
    email: '邮箱',
    github: 'GitHub',
    gitee: 'Gitee',
    wechat: '微信',
    phone: '电话',
  }
  return labels[key] || key
}

const goToProject = (id) => {
  router.push(`/projects/${id}`)
}

const filteredContact = computed(() => {
  const c = profile.value.contact || {}
  const result = []
  if (c.email) {
    result.push({ key: 'email', value: c.email })
  }
  if (c.phone) {
    result.push({ key: 'phone', value: c.phone })
  }
  return result
})

onMounted(async () => {
  try {
    const [profileData, projectsData] = await Promise.all([
      getProfile().catch(() => ({
        name: '开发者',
        position: '全栈工程师',
        bio: '热爱技术与设计，专注于构建优雅的 Web 应用。',
        skills: ['Vue.js', 'React', 'TypeScript', 'Node.js'],
        contact: { email: 'hello@example.com' },
      })),
      getProjects().catch(() => []),
    ])

    profile.value = profileData || profile.value
    featuredProjects.value = (projectsData || []).slice(0, 3)
  } catch (error) {
    console.error('加载首页数据失败:', error)
    ElMessage.warning('首页数据加载失败，使用默认数据')
  }
})
</script>

<style lang="scss" scoped>
.hero-section {
  min-height: 100vh;
  display: flex;
  align-items: center;
  padding: 80px 0 48px;
  position: relative;

  .hero-container {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    position: relative;
  }

  .hero-bg {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 550px;
    height: 650px;
    z-index: 0;
    pointer-events: none;

    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      filter: drop-shadow(0 0 40px rgba(79, 70, 229, 0.15));
    }
  }

  .hero-content {
    flex: 1;
    max-width: 600px;
    position: relative;
    z-index: 2;

    .hero-name {
      font-size: 3.5rem;
      font-weight: 800;
      margin: 0 0 12px;
      line-height: 1.2;
    }

    .hero-position {
      font-size: 1.5rem;
      color: #818cf8;
      margin: 0 0 20px;
      font-weight: 500;
    }

    .hero-bio {
      font-size: 1rem;
      color: #94a3b8;
      margin: 0 0 32px;
      max-width: 500px;
      line-height: 1.8;
    }

    .hero-actions {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
    }
  }

  .hero-stats {
    flex: 0 0 auto;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;

    .stat-item {
      padding: 24px !important;
      text-align: center;

      .stat-number {
        display: block;
        font-size: 2rem;
        font-weight: 800;
        margin-bottom: 4px;
      }

      .stat-label {
        color: #64748b;
        font-size: 0.85rem;
      }
    }
  }
}

.featured-section {
  padding: 80px 0;

  .project-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 24px;
    margin-bottom: 40px;
  }

  .project-card {
    cursor: pointer;
    overflow: hidden;
    padding: 0 !important;

    .project-cover {
      height: 200px;
      overflow: hidden;
      position: relative;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.5s ease;
      }

      &:hover img {
        transform: scale(1.05);
      }

      .cover-placeholder {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(79, 70, 229, 0.1);
        color: #6366f1;
        font-size: 3rem;
      }
    }

    .project-info {
      padding: 20px !important;
    }

    .project-title {
      font-size: 1.1rem;
      font-weight: 600;
      margin: 0 0 8px;
      color: #f1f5f9;
    }

    .project-desc {
      font-size: 0.85rem;
      color: #94a3b8;
      margin: 0 0 12px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .project-tags {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
    }
  }

  .view-more {
    text-align: center;
  }
}

.skills-section {
  padding: 80px 0;

  .skills-cloud {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    justify-content: center;
    max-width: 800px;
    margin: 0 auto;
  }

  .skill-tag {
    padding: 8px 20px;
    background: rgba(79, 70, 229, 0.1);
    border: 1px solid rgba(79, 70, 229, 0.3);
    border-radius: 20px;
    color: #a5b4fc;
    font-size: 0.9rem;
    cursor: default;
    transition: all 0.3s ease;
    animation: fadeInUp 0.6s ease forwards;
    opacity: 0;

    &:hover {
      background: rgba(79, 70, 229, 0.2);
      border-color: rgba(79, 70, 229, 0.6);
      color: #c7d2fe;
      transform: translateY(-2px);
      box-shadow: 0 4px 16px rgba(79, 70, 229, 0.2);
    }
  }
}

.contact-section {
  padding: 80px 0;

  .contact-grid {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 20px;
    max-width: 600px;
    margin: 0 auto;
  }

  .contact-item {
    flex: 0 0 auto;
    min-width: 200px;
    padding: 28px 32px !important;
    cursor: pointer;

    .contact-icon {
      color: #818cf8;
      margin-bottom: 12px;
    }

    .contact-label {
      display: block;
      color: #64748b;
      font-size: 0.8rem;
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .contact-value {
      color: #94a3b8;
      font-size: 0.9rem;
      word-break: break-all;
      transition: color 0.3s ease;

      &:hover {
        color: #818cf8;
      }
    }
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// Tablet
@media (max-width: 1024px) {
  .hero-section {
    .hero-container {
      gap: 32px;
    }

    .hero-stats {
      grid-template-columns: repeat(3, 1fr);
    }
  }
}

// Mobile
@media (max-width: 768px) {
  .hero-section {
    min-height: auto;
    padding: 60px 0 40px;

    .hero-container {
      flex-direction: column;
      text-align: center;
      gap: 24px;
    }

    .hero-bg {
      display: block;
      width: 280px;
      height: 350px;
      opacity: 0.6;
    }

    .hero-content {
      .hero-name {
        font-size: 2.2rem;
      }

      .hero-position {
        font-size: 1.2rem;
      }

      .hero-bio {
        max-width: 100%;
        margin: 0 0 24px;
      }

      .hero-actions {
        justify-content: center;
      }
    }

    .hero-stats {
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;

      .stat-item {
        padding: 16px 8px !important;

        .stat-number {
          font-size: 1.5rem;
        }

        .stat-label {
          font-size: 0.75rem;
        }
      }
    }
  }

  .featured-section {
    padding: 60px 0;

    .project-grid {
      grid-template-columns: 1fr;
      gap: 20px;
    }
  }

  .skills-section {
    padding: 60px 0;

    .skills-cloud {
      max-width: 100%;
    }
  }

  .contact-section {
    padding: 60px 0;

    .contact-grid {
      flex-direction: column;
      align-items: center;
      max-width: 100%;
    }

    .contact-item {
      width: 100%;
      min-width: unset;
      padding: 20px !important;
    }
  }
}

// Small mobile
@media (max-width: 480px) {
  .hero-section {
    .hero-bg {
      width: 220px;
      height: 280px;
    }

    .hero-content {
      .hero-name {
        font-size: 1.6rem;
      }

      .hero-position {
        font-size: 1rem;
      }
    }

    .hero-stats {
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;

      .stat-item {
        padding: 12px 4px !important;

        .stat-number {
          font-size: 1.3rem;
        }

        .stat-label {
          font-size: 0.7rem;
        }
      }
    }
  }

  .featured-section {
    .project-grid {
      gap: 16px;
    }

    .project-card {
      .project-cover {
        height: 160px;
      }

      .project-info {
        padding: 16px !important;
      }
    }
  }

  .skills-section {
    .skill-tag {
      padding: 6px 14px;
      font-size: 0.85rem;
    }
  }

  .contact-section {
    .contact-item {
      padding: 16px !important;
    }
  }
}
</style>
