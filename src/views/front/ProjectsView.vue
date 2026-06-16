<template>
  <div class="projects-view">
    <div class="container">
      <h1 class="section-title gradient-text">项目展示</h1>

      <!-- 筛选 -->
      <div class="filter-bar">
        <el-tag
          :effect="filterTag === '' ? 'dark' : 'plain'"
          class="filter-tag"
          @click="filterTag = ''"
          round
        >
          全部
        </el-tag>
        <el-tag
          v-for="tag in allTags"
          :key="tag"
          :effect="filterTag === tag ? 'dark' : 'plain'"
          class="filter-tag"
          @click="filterTag = tag"
          round
        >
          {{ tag }}
        </el-tag>
      </div>

      <!-- 项目列表 -->
      <div class="projects-grid" v-loading="loading">
        <div
          v-for="project in filteredProjects"
          :key="project.id"
          class="project-card glass-card card-hover"
          @click="goToDetail(project.id)"
        >
          <div class="project-cover">
            <img v-if="project.cover" :src="project.cover" alt="" loading="lazy" />
            <div v-else class="cover-placeholder">
              <el-icon :size="48"><Picture /></el-icon>
            </div>
            <div class="cover-overlay">
              <el-icon :size="24"><View /></el-icon>
            </div>
          </div>
          <div class="project-info">
            <h3 class="project-title">{{ project.title }}</h3>
            <p class="project-desc">{{ project.description }}</p>
            <div class="project-tags">
              <el-tag
                v-for="tag in (project.tags || []).slice(0, 4)"
                :key="tag"
                size="small"
                effect="plain"
                round
              >
                {{ tag }}
              </el-tag>
            </div>
            <div class="project-links" v-if="project.source_url">
              <a
                :href="project.source_url"
                target="_blank"
                @click.stop
                class="project-link"
              >
                <el-icon><Link /></el-icon>
                源代码
              </a>
              <a
                v-if="project.report_url"
                :href="project.report_url"
                target="_blank"
                @click.stop
                class="project-link"
              >
                <el-icon><Document /></el-icon>
                报告
              </a>
            </div>
          </div>
        </div>
      </div>

      <div v-if="!filteredProjects.length && !loading" class="empty-state">
        <el-empty description="暂无项目" :image-size="120" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getProjects } from '@/api'
import { ElMessage } from 'element-plus'

const router = useRouter()
const projects = ref([])
const loading = ref(true)
const filterTag = ref('')

const allTags = computed(() => {
  const tagSet = new Set()
  projects.value.forEach((p) => (p.tags || []).forEach((t) => tagSet.add(t)))
  return Array.from(tagSet)
})

const filteredProjects = computed(() => {
  if (!filterTag.value) return projects.value
  return projects.value.filter((p) => (p.tags || []).includes(filterTag.value))
})

const goToDetail = (id) => {
  router.push(`/projects/${id}`)
}

onMounted(async () => {
  try {
    const data = await getProjects()
    projects.value = data || []
  } catch (error) {
    console.error('加载项目列表失败:', error)
    ElMessage.warning('项目列表加载失败')
  } finally {
    loading.value = false
  }
})
</script>

<style lang="scss" scoped>
.filter-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
  margin-bottom: 32px;

  .filter-tag {
    cursor: pointer;
    transition: all 0.3s ease;
    background: rgba(79, 70, 229, 0.05) !important;
    border-color: rgba(79, 70, 229, 0.2) !important;
    color: #94a3b8 !important;

    &:hover {
      background: rgba(79, 70, 229, 0.15) !important;
      border-color: rgba(79, 70, 229, 0.4) !important;
    }
  }
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
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
      transform: scale(1.08);
    }

    .cover-placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(79, 70, 229, 0.08);
      color: #6366f1;
    }

    .cover-overlay {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(10, 14, 26, 0.6);
      color: white;
      opacity: 0;
      transition: opacity 0.3s ease;

      &:hover {
        opacity: 1;
      }
    }
  }

  .project-info {
    padding: 20px !important;
  }

  .project-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: #f1f5f9;
    margin: 0 0 8px;
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
    margin-bottom: 12px;
  }

  .project-links {
    display: flex;
    gap: 16px;

    .project-link {
      display: flex;
      align-items: center;
      gap: 4px;
      color: #818cf8;
      font-size: 0.85rem;
      transition: color 0.3s ease;

      &:hover {
        color: #22d3ee;
      }
    }
  }
}

.empty-state {
  text-align: center;
  padding: 80px 0;
}

@media (max-width: 768px) {
  .filter-bar {
    gap: 6px;
    margin-bottom: 20px;

    .filter-tag {
      font-size: 0.8rem;
      padding: 4px 12px;
    }
  }

  .projects-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}

@media (max-width: 480px) {
  .project-card {
    .project-cover {
      height: 160px;
    }

    .project-info {
      padding: 16px !important;
    }

    .project-links {
      flex-wrap: wrap;
      gap: 10px;
    }
  }
}
</style>
