<template>
  <div class="project-detail-view" v-loading="loading">
    <div class="container">
      <div class="detail-back" v-if="project">
        <router-link to="/projects" class="back-link">
          <el-icon><ArrowLeft /></el-icon>
          返回项目列表
        </router-link>
      </div>

      <div v-if="project" class="detail-content">
        <!-- 项目头部 -->
        <div class="detail-header glass-card">
          <h1 class="detail-title gradient-text">{{ project.title }}</h1>
          <p class="detail-desc">{{ project.description }}</p>
          <div class="detail-tags">
            <el-tag
              v-for="tag in (project.tags || [])"
              :key="tag"
              effect="plain"
              round
            >
              {{ tag }}
            </el-tag>
          </div>
          <div class="detail-links" v-if="project.source_url || project.demo_url || project.report_url">
            <a
              v-if="project.source_url"
              :href="project.source_url"
              target="_blank"
              class="detail-link"
            >
              <el-icon><Link /></el-icon>
              源代码
            </a>
            <a
              v-if="project.demo_url"
              :href="project.demo_url"
              target="_blank"
              class="detail-link"
            >
              <el-icon><View /></el-icon>
              在线演示
            </a>
            <a
              v-if="project.report_url"
              :href="project.report_url"
              target="_blank"
              class="detail-link"
            >
              <el-icon><Document /></el-icon>
              项目报告
            </a>
          </div>
        </div>

        <!-- 项目需求 -->
        <div class="detail-section glass-card" v-if="project.requirement">
          <h3 class="section-heading">
            <el-icon><List /></el-icon>
            项目需求
          </h3>
          <div class="requirement-text">{{ project.requirement }}</div>
        </div>

        <!-- 项目报告 PDF 预览 -->
        <div class="detail-section glass-card" v-if="project.report_url">
          <h3 class="section-heading">
            <el-icon><Document /></el-icon>
            项目报告
          </h3>
          <div class="pdf-preview">
            <iframe :src="getPdfPreviewUrl(project.report_url)" frameborder="0" class="pdf-frame"></iframe>
          </div>
        </div>

        <!-- 项目图片灯箱 -->
        <div class="detail-section glass-card" v-if="project.images?.length">
          <h3 class="section-heading">
            <el-icon><Picture /></el-icon>
            项目截图
          </h3>
          <div class="images-gallery">
            <div
              v-for="(img, index) in project.images"
              :key="index"
              class="gallery-item"
              @click="openViewer(index)"
            >
              <img :src="img" alt="" loading="lazy" />
            </div>
          </div>
          <!-- Viewerjs 实例 -->
          <div ref="viewerRef" class="viewer-container" style="display: none">
            <img v-for="(img, index) in project.images" :key="index" :src="img" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getProject } from '@/api'
import { ElMessage } from 'element-plus'
import Viewer from 'viewerjs'
import 'viewerjs/dist/viewer.css'

const route = useRoute()
const loading = ref(true)
const project = ref(null)
const viewerRef = ref(null)
let viewerInstance = null

const getPdfPreviewUrl = (url) => {
  // 优先尝试浏览器原生 PDF 预览，失败则 fallback 到下载
  return url
}

const openViewer = (index) => {
  if (!viewerInstance) {
    viewerInstance = new Viewer(viewerRef.value, {
      toolbar: true,
      navbar: true,
      title: true,
      clickable: true,
    })
  }
  viewerInstance.zoomTo(0)
  viewerInstance.go(index)
  viewerInstance.show()
}

onMounted(async () => {
  try {
    const data = await getProject(route.params.id)
    project.value = data
  } catch (error) {
    console.error('加载项目详情失败:', error)
    ElMessage.error('项目详情加载失败')
  } finally {
    loading.value = false
  }
})
</script>

<style lang="scss" scoped>
.detail-back {
  margin-bottom: 24px;

  .back-link {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: #94a3b8;
    font-size: 0.9rem;
    transition: color 0.3s ease;

    &:hover {
      color: #818cf8;
    }
  }
}

.detail-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.detail-header {
  padding: 32px !important;

  .detail-title {
    font-size: 2rem;
    font-weight: 700;
    margin: 0 0 16px;
  }

  .detail-desc {
    color: #94a3b8;
    line-height: 1.8;
    margin: 0 0 20px;
  }

  .detail-tags {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 20px;
  }

  .detail-links {
    display: flex;
    gap: 20px;

    .detail-link {
      display: flex;
      align-items: center;
      gap: 6px;
      color: #818cf8;
      font-size: 0.95rem;
      padding: 8px 16px;
      border: 1px solid rgba(79, 70, 229, 0.3);
      border-radius: 8px;
      transition: all 0.3s ease;

      &:hover {
        background: rgba(79, 70, 229, 0.1);
        border-color: rgba(79, 70, 229, 0.5);
        color: #a5b4fc;
      }
    }
  }
}

.detail-section {
  padding: 32px !important;

  .section-heading {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 1.2rem;
    font-weight: 600;
    color: #f1f5f9;
    margin: 0 0 20px;

    .el-icon {
      color: #818cf8;
    }
  }
}

.requirement-text {
  color: #94a3b8;
  line-height: 1.8;
  white-space: pre-wrap;
}

.pdf-preview {
  border-radius: 8px;
  overflow: hidden;
  background: #fff;

  .pdf-frame {
    width: 100%;
    height: 500px;
    border: none;
  }
}

.images-gallery {
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
}

// Tablet
@media (max-width: 1024px) {
  .detail-header {
    padding: 24px !important;
    .detail-title { font-size: 1.6rem; }
  }

  .detail-section {
    padding: 24px !important;
  }
}

// Mobile
@media (max-width: 768px) {
  .detail-header {
    padding: 20px !important;
    .detail-title { font-size: 1.4rem; }
    .detail-links { flex-wrap: wrap; gap: 10px; }
  }

  .detail-section {
    padding: 20px !important;
    .section-heading { font-size: 1rem; }

    .pdf-preview {
      .pdf-frame {
        height: 350px;
      }
    }
  }

  .images-gallery {
    grid-template-columns: 1fr;
    gap: 12px;
  }
}

// Small mobile
@media (max-width: 480px) {
  .detail-header {
    .detail-title { font-size: 1.2rem; }
    .detail-desc { font-size: 0.9rem; }
    .detail-link { font-size: 0.85rem; padding: 6px 12px; }
  }

  .detail-section {
    padding: 16px !important;

    .pdf-preview {
      .pdf-frame {
        height: 250px;
      }
    }
  }
}
</style>
