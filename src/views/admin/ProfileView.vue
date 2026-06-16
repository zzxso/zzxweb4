<template>
  <div class="profile-view">
    <div class="view-header">
      <h2 class="view-title">个人资料</h2>
    </div>

    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-position="top"
      class="profile-form"
      v-loading="pageLoading"
    >
      <div class="form-section">
        <h3 class="section-heading">基本信息</h3>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="姓名" prop="name">
              <el-input v-model="form.name" placeholder="请输入姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="职位" prop="position">
              <el-input v-model="form.position" placeholder="请输入职位" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="个人简介" prop="bio">
          <el-input
            v-model="form.bio"
            type="textarea"
            :rows="4"
            placeholder="请输入个人简介"
          />
        </el-form-item>
      </div>

      <div class="form-section">
        <h3 class="section-heading">头像上传</h3>
        <div class="avatar-upload">
          <div class="avatar-preview" v-if="form.avatar">
            <img :src="form.avatar" alt="头像" />
            <div class="avatar-actions">
              <el-button size="small" @click="triggerFile('avatar')" type="primary" plain>
                更换
              </el-button>
              <el-button size="small" @click="form.avatar = ''" type="danger" plain>
                删除
              </el-button>
            </div>
          </div>
          <div v-else class="avatar-empty" @click="triggerFile('avatar')">
            <el-icon :size="40"><Plus /></el-icon>
            <span>点击上传头像</span>
          </div>
          <input
            ref="avatarInput"
            type="file"
            accept="image/*"
            style="display: none"
            @change="handleFileUpload($event, 'avatar')"
          />
          <div v-if="uploading === 'avatar'" class="upload-progress">
            <el-progress :percentage="uploadProgress" :stroke-width="4" />
          </div>
        </div>
      </div>

      <div class="form-section">
        <h3 class="section-heading">简历图片</h3>
        <div class="avatar-upload">
          <div class="avatar-preview" v-if="form.resume_image">
            <img :src="form.resume_image" alt="简历" />
            <div class="avatar-actions">
              <el-button size="small" @click="triggerFile('resume')" type="primary" plain>
                更换
              </el-button>
              <el-button size="small" @click="form.resume_image = ''" type="danger" plain>
                删除
              </el-button>
            </div>
          </div>
          <div v-else class="avatar-empty" @click="triggerFile('resume')">
            <el-icon :size="40"><Plus /></el-icon>
            <span>点击上传简历</span>
          </div>
          <input
            ref="resumeInput"
            type="file"
            accept="image/*"
            style="display: none"
            @change="handleFileUpload($event, 'resume')"
          />
          <div v-if="uploading === 'resume'" class="upload-progress">
            <el-progress :percentage="uploadProgress" :stroke-width="4" />
          </div>
        </div>
      </div>

      <div class="form-section">
        <h3 class="section-heading">技能标签</h3>
        <el-form-item label="技能">
          <el-select
            v-model="form.skills"
            multiple
            filterable
            allow-create
            default-first-option
            placeholder="输入技能名称，按回车添加"
            style="width: 100%"
          />
        </el-form-item>
      </div>

      <div class="form-section">
        <h3 class="section-heading">教育背景</h3>
        <div v-for="(edu, index) in form.education" :key="index" class="edu-row">
          <el-row :gutter="12">
            <el-col :span="6">
              <el-input v-model="edu.degree" placeholder="学历" />
            </el-col>
            <el-col :span="6">
              <el-input v-model="edu.school" placeholder="学校" />
            </el-col>
            <el-col :span="4">
              <el-input-number v-model="edu.start_year" :min="1950" :max="2030" placeholder="起始年" />
            </el-col>
            <el-col :span="4">
              <el-input-number v-model="edu.end_year" :min="1950" :max="2030" placeholder="结束年" />
            </el-col>
            <el-col :span="4">
              <el-button type="danger" :icon="Delete" circle @click="removeEducation(index)" />
            </el-col>
          </el-row>
        </div>
        <el-button text @click="addEducation" style="color: #818cf8; margin-top: 12px">
          <el-icon><Plus /></el-icon>
          添加教育背景
        </el-button>
      </div>

      <div class="form-section">
        <h3 class="section-heading">联系方式</h3>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="邮箱">
              <el-input v-model="contactForm.email" placeholder="example@mail.com" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="电话">
              <el-input v-model="contactForm.phone" placeholder="138-0000-0000" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="GitHub">
              <el-input v-model="contactForm.github" placeholder="https://github.com/..." />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Gitee">
              <el-input v-model="contactForm.gitee" placeholder="https://gitee.com/..." />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="微信">
          <el-input v-model="contactForm.wechat" placeholder="微信号" />
        </el-form-item>
      </div>

      <div class="form-actions">
        <el-button type="primary" :loading="saving" @click="handleSave">
          保存修改
        </el-button>
      </div>
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getProfile, uploadFile, deleteFile } from '@/api'
import { supabase } from '@/utils/supabase'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Delete, Plus } from '@element-plus/icons-vue'

const formRef = ref(null)
const pageLoading = ref(true)
const saving = ref(false)
const uploading = ref('')
const uploadProgress = ref(0)
const avatarInput = ref(null)
const resumeInput = ref(null)
const profileId = ref(null)

const form = reactive({
  name: '',
  position: '',
  avatar: '',
  resume_image: '',
  bio: '',
  skills: [],
  education: [],
})

const contactForm = reactive({
  email: '',
  phone: '',
  github: '',
  gitee: '',
  wechat: '',
})

const rules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  position: [{ required: true, message: '请输入职位', trigger: 'blur' }],
}

const triggerFile = (type) => {
  if (type === 'avatar') avatarInput.value?.click()
  if (type === 'resume') resumeInput.value?.click()
}

const handleFileUpload = async (event, type) => {
  const file = event.target.files[0]
  if (!file) return

  const path = type === 'avatar' ? 'avatar/' : 'resume/'
  uploading.value = type
  uploadProgress.value = 0

  try {
    const url = await uploadFile(file, path)
    if (type === 'avatar') form.avatar = url
    else form.resume_image = url
    ElMessage.success('上传成功')
  } catch (error) {
    console.error('上传失败:', error)
    ElMessage.error('上传失败: ' + (error.message || '未知错误'))
  } finally {
    uploading.value = ''
    event.target.value = ''
  }
}

const addEducation = () => {
  form.education.push({ degree: '', school: '', start_year: null, end_year: null })
}

const removeEducation = async (index) => {
  await ElMessageBox.confirm('确定删除该教育背景？', '提示', { type: 'warning' })
  form.education.splice(index, 1)
}

const handleSave = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  saving.value = true
  try {
    const payload = {
      name: form.name,
      position: form.position,
      avatar: form.avatar,
      resume_image: form.resume_image,
      bio: form.bio,
      skills: form.skills,
      education: form.education,
      contact: contactForm,
    }
    // 直接用 onMounted 时拿到的 id 更新
    const { error } = await supabase
      .from('profile')
      .update(payload)
      .eq('id', profileId.value)
    if (error) throw error
    ElMessage.success('保存成功')
  } catch (error) {
    console.error('保存失败:', error)
    ElMessage.error('保存失败: ' + (error.message || JSON.stringify(error)))
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  try {
    const data = await getProfile()
    if (data) {
      profileId.value = data.id
      form.name = data.name || ''
      form.position = data.position || ''
      form.avatar = data.avatar || ''
      form.resume_image = data.resume_image || ''
      form.bio = data.bio || ''
      form.skills = data.skills || []
      form.education = data.education || []
      if (data.contact) {
        Object.assign(contactForm, data.contact)
      }
    }
  } catch (error) {
    console.error('加载个人资料失败:', error)
    ElMessage.error('加载个人资料失败')
  } finally {
    pageLoading.value = false
  }
})
</script>

<style lang="scss" scoped>
@import '@/assets/styles/global.scss';
.profile-view {
  .view-header {
    margin-bottom: 24px;

    .view-title {
      font-size: 1.3rem;
      font-weight: 600;
      color: #f1f5f9;
      margin: 0;
    }
  }

  .profile-form {
    .form-section {
      padding: 24px;
      margin-bottom: 20px;
      background: rgba(17, 24, 39, 0.5);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 12px;

      .section-heading {
        font-size: 1rem;
        font-weight: 600;
        color: #818cf8;
        margin: 0 0 20px;
      }
    }
  }

  .avatar-upload {
    .avatar-preview {
      position: relative;
      width: 120px;
      height: 120px;
      border-radius: 12px;
      overflow: hidden;
      border: 2px solid rgba(79, 70, 229, 0.3);

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .avatar-actions {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        padding: 8px;
        display: flex;
        gap: 6px;
        background: rgba(0, 0, 0, 0.7);
        opacity: 1;
        transition: opacity 0.3s ease;
      }
    }

    .avatar-empty {
      width: 120px;
      height: 120px;
      border-radius: 12px;
      border: 2px dashed rgba(79, 70, 229, 0.3);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 8px;
      cursor: pointer;
      color: #64748b;
      transition: all 0.3s ease;

      &:hover {
        border-color: rgba(79, 70, 229, 0.6);
        color: #818cf8;
      }
    }
  }

  .edu-row {
    padding: 12px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  }

  .form-actions {
    text-align: center;
    padding: 20px;
    margin-top: 8px;
    background: rgba(17, 24, 39, 0.5);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 12px;
  }
}

// Tablet
@media (max-width: 1024px) {
  .profile-view {
    .profile-form .form-section {
      padding: 20px;
    }
  }
}

// Mobile
@media (max-width: 768px) {
  .profile-view {
    .profile-form .form-section {
      padding: 16px;

      .section-heading {
        font-size: 0.95rem;
        margin-bottom: 16px;
      }
    }

    .avatar-upload {
      .avatar-preview,
      .avatar-empty {
        width: 100px;
        height: 100px;
      }
    }

    .form-actions {
      padding: 16px;
    }
  }
}

// Small mobile
@media (max-width: 480px) {
  .profile-view {
    .view-header .view-title {
      font-size: 1.1rem;
    }

    .profile-form .form-section {
      padding: 12px;
    }

    .avatar-upload {
      .avatar-preview,
      .avatar-empty {
        width: 80px;
        height: 80px;
      }
    }
  }
}
</style>
