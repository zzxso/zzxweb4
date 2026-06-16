<template>
  <div class="resources-view">
    <div class="container">
      <h1 class="section-title gradient-text">资源分享</h1>

      <!-- 分类筛选 -->
      <div class="filter-bar">
        <el-tag
          :effect="currentCategory === '' ? 'dark' : 'plain'"
          class="filter-tag"
          @click="currentCategory = ''"
          round
        >
          全部
        </el-tag>
        <el-tag
          v-for="cat in categories"
          :key="cat.value"
          :effect="currentCategory === cat.value ? 'dark' : 'plain'"
          class="filter-tag"
          @click="currentCategory = cat.value"
          round
        >
          {{ cat.label }}
        </el-tag>
      </div>

      <!-- 资源列表 -->
      <div class="resources-grid" v-loading="loading">
        <div
          v-for="resource in filteredResources"
          :key="resource.id"
          class="resource-card glass-card card-hover"
        >
          <div class="resource-cover" v-if="resource.cover">
            <img :src="resource.cover" alt="" loading="lazy" />
          </div>
          <div class="resource-info">
            <div class="resource-category">
              <el-tag size="small" effect="plain" round>
                {{ getCategoryLabel(resource.category) }}
              </el-tag>
            </div>
            <h3 class="resource-title">{{ resource.title }}</h3>
            <p class="resource-desc">{{ resource.description }}</p>
            <!-- 视频/音频在线预览 -->
            <div v-if="resource.category === 'video' && resource.file_url" class="media-preview">
              <video :src="resource.file_url" controls preload="metadata" class="media-player">
                您的浏览器不支持视频播放
              </video>
            </div>
            <div v-else-if="resource.category === 'music' && resource.file_url" class="media-preview">
              <audio :src="resource.file_url" controls preload="metadata" class="media-player">
                您的浏览器不支持音频播放
              </audio>
            </div>
            <!-- 图片预览 -->
            <div v-else-if="resource.category === 'image' && resource.file_url" class="media-preview">
              <img :src="resource.file_url" alt="" class="preview-image" @click="openImageViewer(resource)" />
            </div>
            <!-- 文章显示内容摘要 -->
            <div v-else-if="resource.category === 'article' && resource.content" class="article-content" v-html="renderMarkdown(resource.content)"></div>
            <!-- PDF 在线预览 -->
            <div v-else-if="isPdf(resource) && resource.file_url" class="pdf-preview">
              <iframe :src="getPdfPreviewUrl(resource.file_url)" frameborder="0" class="pdf-frame"></iframe>
            </div>
            <!-- Word 文档提示 -->
            <div v-else-if="isWord(resource) && resource.file_url" class="doc-preview">
              <el-icon :size="48" color="#64748b"><Document /></el-icon>
              <p>文档文件，点击按钮下载或在新窗口查看</p>
            </div>
            <div class="resource-actions">
              <!-- 文件下载/播放 -->
              <a
                v-if="resource.file_url"
                :href="resource.file_url"
                target="_blank"
                class="resource-action-btn"
              >
                <el-icon><Download /></el-icon>
                <span>{{ getFileActionLabel(resource) }}</span>
              </a>
              <!-- 外链跳转 -->
              <a
                v-if="resource.external_url"
                :href="resource.external_url"
                target="_blank"
                class="resource-action-btn"
              >
                <el-icon><Link /></el-icon>
                <span>访问链接</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      <div v-if="!filteredResources.length && !loading" class="empty-state">
        <el-empty description="暂无资源" :image-size="120" />
      </div>
    </div>

    <!-- 图片查看器 -->
    <el-dialog v-model="imageViewerVisible" :show-close="true" width="80vw">
      <img :src="imageViewerSrc" alt="" style="width: 100%" />
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getResources } from '@/api'
import { ElMessage } from 'element-plus'
import { Document } from '@element-plus/icons-vue'

const resources = ref([])
const loading = ref(true)
const currentCategory = ref('')

const categories = [
  { label: '音乐', value: 'music' },
  { label: '视频', value: 'video' },
  { label: '图片', value: 'image' },
  { label: '文章', value: 'article' },
  { label: '网站', value: 'website' },
  { label: '软件', value: 'software' },
]

const filteredResources = computed(() => {
  if (!currentCategory.value) return resources.value
  return resources.value.filter(
    (r) => r.category === currentCategory.value
  )
})

const getCategoryLabel = (cat) => {
  const found = categories.find((c) => c.value === cat)
  return found ? found.label : cat
}

const getFileActionLabel = (resource) => {
  if (resource.category === 'video') return '播放'
  if (resource.category === 'music') return '播放'
  if (resource.category === 'image') return '查看'
  if (resource.category === 'article') return '阅读全文'
  if (isPdf(resource)) return '预览 PDF'
  return '下载'
}

// 简单的 Markdown 渲染（支持标题、粗体、斜体、列表、链接、换行）
const renderMarkdown = (text) => {
  if (!text) return ''
  let html = text
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^\- (.+)$/gm, '<li>$1</li>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank">$1</a>')
    .replace(/\n/g, '<br>')
  // Wrap consecutive <li> in <ul>
  html = html.replace(/(<li>.*?<\/li>(?:<br>)?)+/gs, (match) => {
    const items = match.replace(/<br>/g, '')
    return `<ul>${items}</ul>`
  })
  return html
}

// 图片查看器
const imageViewerVisible = ref(false)
const imageViewerSrc = ref('')
const openImageViewer = (resource) => {
  imageViewerSrc.value = resource.file_url
  imageViewerVisible.value = true
}

const isPdf = (resource) => {
  if (!resource.file_url) return false
  return /\.(pdf)$/i.test(resource.file_url)
}

const isWord = (resource) => {
  if (!resource.file_url) return false
  return /\.(docx?|xlsx?|pptx?)$/i.test(resource.file_url)
}

const getPdfPreviewUrl = (url) => {
  // 浏览器原生 PDF 预览（国内可用）
  return url
}

onMounted(async () => {
  try {
    const data = await getResources()
    resources.value = data || []
  } catch (error) {
    console.error('加载资源列表失败:', error)
    ElMessage.warning('资源列表加载失败')
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
    }
  }
}

.resources-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 24px;
}

.resource-card {
  overflow: hidden;
  padding: 0 !important;
  display: flex;
  flex-direction: column;
  max-height: 420px;

  .resource-cover {
    height: 160px;
    overflow: hidden;
    flex-shrink: 0;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.5s ease;
    }

    &:hover img {
      transform: scale(1.05);
    }
  }

  .resource-info {
    padding: 20px !important;
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .resource-category {
    margin-bottom: 8px;
  }

  .resource-title {
    font-size: 1.05rem;
    font-weight: 600;
    color: #f1f5f9;
    margin: 0 0 8px;
  }

  .resource-desc {
    font-size: 0.85rem;
    color: #94a3b8;
    margin: 0 0 16px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .resource-actions {
    display: flex;
    gap: 10px;
  }

  .resource-action-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 6px 14px;
    border: 1px solid rgba(79, 70, 229, 0.3);
    border-radius: 8px;
    color: #818cf8;
    font-size: 0.8rem;
    transition: all 0.3s ease;

    &:hover {
      background: rgba(79, 70, 229, 0.15);
      border-color: rgba(79, 70, 229, 0.5);
      color: #a5b4fc;
    }
  }

  .media-preview {
    margin-bottom: 12px;
    border-radius: 8px;
    overflow: hidden;
    background: rgba(0, 0, 0, 0.3);
    flex-shrink: 0;

    video,
    audio {
      width: 100%;
      max-height: 160px;
      display: block;
    }

    .preview-image {
      width: 100%;
      max-height: 200px;
      object-fit: cover;
      cursor: pointer;
      transition: opacity 0.3s;

      &:hover {
        opacity: 0.85;
      }
    }
  }

  .article-content {
    margin-bottom: 12px;
    padding: 12px;
    background: rgba(79, 70, 229, 0.05);
    border-radius: 8px;
    font-size: 0.85rem;
    color: #cbd5e1;
    line-height: 1.8;
    max-height: 120px;
    overflow-y: auto;
    flex-shrink: 0;

    h1, h2, h3 {
      font-size: 1rem;
      color: #f1f5f9;
      margin: 8px 0 4px;
    }

    strong {
      color: #e2e8f0;
    }

    a {
      color: #818cf8;
    }
  }

  .pdf-preview {
    margin-bottom: 12px;
    border-radius: 8px;
    overflow: hidden;
    background: #fff;
    flex-shrink: 0;

    .pdf-frame {
      width: 100%;
      height: 300px;
      border: none;
    }
  }

  .doc-preview {
    margin-bottom: 12px;
    padding: 24px;
    border-radius: 8px;
    background: rgba(79, 70, 229, 0.05);
    border: 1px dashed rgba(79, 70, 229, 0.3);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    color: #64748b;
    flex-shrink: 0;
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

  .resources-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}

@media (max-width: 480px) {
  .resource-card {
    .resource-cover {
      height: 140px;
    }

    .resource-info {
      padding: 16px !important;
    }

    .resource-actions {
      flex-wrap: wrap;
    }
  }
}
</style>
