<template>
  <div class="about-view">
    <div class="container">
      <h1 class="section-title gradient-text">关于我</h1>

      <div class="about-content">
        <!-- 个人信息卡片 -->
        <div class="about-profile glass-card">
          <div class="profile-header">
            <div class="profile-avatar" v-if="profile.avatar">
              <img :src="profile.avatar" :alt="profile.name" />
            </div>
            <div class="profile-info">
              <h2 class="profile-name gradient-text">{{ profile.name }}</h2>
              <p class="profile-position">{{ profile.position }}</p>
            </div>
          </div>
          <p class="profile-bio">{{ profile.bio }}</p>
        </div>

        <!-- 教育背景 -->
        <div class="about-section glass-card">
          <h3 class="section-heading">
            <el-icon><School /></el-icon>
            教育背景
          </h3>
          <div class="education-timeline">
            <div
              v-for="(edu, index) in (profile.education || [])"
              :key="index"
              class="education-item"
            >
              <div class="edu-year">{{ edu.start_year }} - {{ edu.end_year }}</div>
              <div class="edu-content">
                <h4 class="edu-degree">{{ edu.degree }}</h4>
                <p class="edu-school">{{ edu.school }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 技能栈 -->
        <div class="about-section glass-card">
          <h3 class="section-heading">
            <el-icon><Cpu /></el-icon>
            技术技能
          </h3>
          <div class="skills-grid">
            <div
              v-for="(skill, index) in (profile.skills || [])"
              :key="skill"
              class="skill-item"
              :style="{ animationDelay: `${index * 0.05}s` }"
            >
              <span class="skill-name">{{ skill }}</span>
              <div class="skill-bar">
                <div
                  class="skill-bar-fill"
                  :style="{ width: `${70 + Math.random() * 30}%` }"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <!-- 联系方式 -->
        <div class="about-section glass-card">
          <h3 class="section-heading">
            <el-icon><ChatLineRound /></el-icon>
            联系方式
          </h3>
          <div class="contact-list">
            <div
              v-for="(info, key) in (profile.contact || {})"
              :key="key"
              class="contact-row"
            >
              <span class="contact-key">{{ getLabel(key) }}</span>
              <a
                v-if="typeof info === 'string' && info.startsWith('http')"
                :href="info"
                target="_blank"
                class="contact-val gradient-text"
              >
                {{ info }}
              </a>
              <span v-else class="contact-val">{{ info }}</span>
            </div>
          </div>
        </div>

        <!-- 简历图片 -->
        <div class="about-section glass-card" v-if="profile.resume_image">
          <h3 class="section-heading">
            <el-icon><Document /></el-icon>
            简历
          </h3>
          <div class="resume-preview">
            <img :src="profile.resume_image" alt="简历" class="resume-img" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getProfile } from '@/api'
import { ElMessage } from 'element-plus'

const profile = ref({
  name: '',
  position: '',
  avatar: '',
  bio: '',
  education: [],
  skills: [],
  contact: {},
  resume_image: '',
})

const getLabel = (key) => {
  const labels = {
    email: '邮箱',
    github: 'GitHub',
    gitee: 'Gitee',
    wechat: '微信',
    phone: '电话',
  }
  return labels[key] || key
}

onMounted(async () => {
  try {
    const data = await getProfile()
    profile.value = data || profile.value
  } catch (error) {
    console.error('加载关于页面失败:', error)
    ElMessage.warning('关于页面数据加载失败')
  }
})
</script>

<style lang="scss" scoped>
.about-view {
  padding: 40px 0 80px;

  .about-content {
    display: flex;
    flex-direction: column;
    gap: 32px;
    max-width: 900px;
    margin: 0 auto;
  }

  .about-profile {
    text-align: center;
    padding: 32px !important;

    .profile-header {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 20px;
      margin-bottom: 16px;
    }

    .profile-avatar {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      overflow: hidden;
      border: 3px solid rgba(79, 70, 229, 0.4);
      box-shadow: 0 0 30px rgba(79, 70, 229, 0.2);

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    .profile-name {
      font-size: 1.5rem;
      font-weight: 700;
      margin: 0;
    }

    .profile-position {
      color: #818cf8;
      font-size: 1rem;
      margin: 4px 0 0;
    }

    .profile-bio {
      color: #94a3b8;
      font-size: 0.95rem;
      line-height: 1.8;
      max-width: 100%;
      margin: 12px auto 0;
    }
  }

  .about-section {
    padding: 24px !important;

    .section-heading {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 1.1rem;
      font-weight: 600;
      color: #f1f5f9;
      margin: 0 0 20px;

      .el-icon {
        color: #818cf8;
      }
    }
  }

  .education-timeline {
    .education-item {
      .edu-year {
        font-size: 0.85rem;
        min-width: 70px;
      }

      .edu-content {
        .edu-degree {
          font-size: 0.95rem;
        }

        .edu-school {
          font-size: 0.85rem;
        }
      }
    }
  }

  .skills-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 12px;
  }

  .contact-list {
    .contact-row {
      padding: 10px 12px;

      .contact-key {
        font-size: 0.85rem;
      }

      .contact-val {
        font-size: 0.85rem;
      }
    }
  }

  .resume-preview {
    .resume-img {
      max-height: 400px;
    }
  }
}

// Tablet
@media (max-width: 1024px) {
  .about-view {
    .about-profile {
      .profile-header {
        flex-direction: column;
        gap: 12px;
      }

      .profile-name {
        font-size: 1.4rem;
      }
    }
  }
}

// Mobile
@media (max-width: 768px) {
  .about-view {
    padding: 32px 0 60px;

    .about-content {
      gap: 20px;
    }

    .about-profile {
      padding: 24px !important;

      .profile-header {
        flex-direction: column;
        gap: 12px;
      }

      .profile-avatar {
        width: 70px;
        height: 70px;
      }

      .profile-name {
        font-size: 1.3rem;
      }
    }

    .about-section {
      padding: 20px !important;
    }

    .education-timeline {
      .education-item {
        flex-direction: column;
        gap: 4px;

        .edu-content {
          padding-left: 12px;
        }
      }
    }

    .skills-grid {
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    }

    .contact-list {
      .contact-row {
        flex-direction: column;
        gap: 4px;
        align-items: flex-start;
      }
    }
  }
}

// Small mobile
@media (max-width: 480px) {
  .about-view {
    .about-profile {
      padding: 16px !important;

      .profile-avatar {
        width: 60px;
        height: 60px;
      }

      .profile-name {
        font-size: 1.2rem;
      }
    }

    .about-section {
      padding: 16px !important;

      .section-heading {
        font-size: 1rem;
      }
    }

    .skills-grid {
      grid-template-columns: 1fr;
    }
  }
}
</style>
