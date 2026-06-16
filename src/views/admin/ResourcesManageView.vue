<template>
  <div class="resources-manage">
    <div class="rm-header">
      <h2 class="rm-title">资源管理</h2>
      <el-button type="primary" @click="openDialog()">
        <el-icon><Plus /></el-icon>
        新增资源
      </el-button>
    </div>

    <!-- 筛选 -->
    <div class="rm-filter">
      <el-tag :effect="filterCat === '' ? 'dark' : 'plain'" class="rm-tag" @click="filterCat = ''" round>全部</el-tag>
      <el-tag v-for="cat in categories" :key="cat.value" :effect="filterCat === cat.value ? 'dark' : 'plain'" class="rm-tag" @click="filterCat = cat.value" round>{{ cat.label }}</el-tag>
    </div>

    <el-table :data="filteredResources" v-loading="loading" stripe class="rm-table">
      <el-table-column prop="title" label="标题" min-width="150">
        <template #default="{ row }">
          <span>{{ row.title }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="category" label="分类" width="90">
        <template #default="{ row }">
          <el-tag size="small" effect="plain" round>{{ getCategoryLabel(row.category) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120" fixed="right">
        <template #default="{ row }">
          <el-button text type="primary" size="small" @click="openDialog(row)">
            <el-icon><Edit /></el-icon>编辑
          </el-button>
          <el-button text type="danger" size="small" @click="handleDelete(row)">
            <el-icon><Delete /></el-icon>删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog
      v-model="dialogVisible"
      :title="editingId ? '编辑资源' : '新增资源'"
      :width="isMobile ? '95%' : '650px'"
      top="5vh"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
        <el-form-item label="资源标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入资源标题" />
        </el-form-item>
        <el-form-item label="分类" prop="category">
          <el-select v-model="form.category" placeholder="请选择分类" style="width: 100%">
            <el-option v-for="cat in categories" :key="cat.value" :label="cat.label" :value="cat.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入资源描述" />
        </el-form-item>
        <el-form-item label="封面">
          <div class="rm-upload">
            <div class="rm-preview" v-if="form.cover">
              <img :src="form.cover" alt="封面" />
              <div class="rm-actions">
                <el-button size="small" @click="triggerUpload('cover')" type="primary" plain>更换</el-button>
                <el-button size="small" @click="form.cover = ''" type="danger" plain>删除</el-button>
              </div>
            </div>
            <div v-else class="rm-placeholder" @click="triggerUpload('cover')">
              <el-icon :size="24"><Upload /></el-icon>
              <span>上传封面</span>
            </div>
            <input ref="coverInput" type="file" accept="image/*" style="display:none" @change="handleCoverUpload" />
          </div>
        </el-form-item>
        <el-form-item label="资源文件">
          <div class="rm-upload">
            <div v-if="form.file_url" class="rm-file-info">
              <el-icon><Document /></el-icon>
              <span>已上传</span>
              <el-button size="small" type="danger" text @click="form.file_url = ''">删除</el-button>
            </div>
            <div v-else class="rm-placeholder" @click="triggerUpload('file')">
              <el-icon :size="24"><Upload /></el-icon>
              <span>上传文件</span>
            </div>
            <input ref="fileInput" type="file" style="display:none" @change="handleFileUpload" />
          </div>
        </el-form-item>
        <el-form-item label="外链地址">
          <el-input v-model="form.external_url" placeholder="https://..." />
        </el-form-item>
        <el-form-item label="文章内容" v-if="form.category === 'article'">
          <el-input v-model="form.content" type="textarea" :rows="8" placeholder="请输入文章内容，支持 Markdown 格式" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleSave">
          {{ editingId ? '更新' : '创建' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted, onUnmounted } from 'vue'
import { getResources, createResource, updateResource, deleteResource, uploadFile } from '@/api'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Edit, Delete, Upload, Document } from '@element-plus/icons-vue'

const loading = ref(true)
const resources = ref([])
const dialogVisible = ref(false)
const editingId = ref(null)
const formRef = ref(null)
const saving = ref(false)
const filterCat = ref('')
const coverInput = ref(null)
const fileInput = ref(null)
const isMobile = ref(false)

const checkMobile = () => { isMobile.value = window.innerWidth <= 768 }

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
  loadResources()
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})

const categories = [
  { label: '音乐', value: 'music' },
  { label: '视频', value: 'video' },
  { label: '图片', value: 'image' },
  { label: '文章', value: 'article' },
  { label: '网站', value: 'website' },
  { label: '软件', value: 'software' },
]

const defaultForm = {
  title: '', cover: '', category: 'article', description: '',
  file_url: '', external_url: '', file_type: '', content: '',
}

const form = reactive({ ...defaultForm })

const rules = {
  title: [{ required: true, message: '请输入资源标题', trigger: 'blur' }],
  category: [{ required: true, message: '请选择分类', trigger: 'change' }],
}

const filteredResources = computed(() => {
  if (!filterCat.value) return resources.value
  return resources.value.filter((r) => r.category === filterCat.value)
})

const getCategoryLabel = (cat) => {
  const found = categories.find((c) => c.value === cat)
  return found ? found.label : cat
}

const resetForm = () => { Object.assign(form, { ...defaultForm }) }

const openDialog = (row) => {
  resetForm()
  if (row) {
    editingId.value = row.id
    Object.assign(form, {
      id: row.id, title: row.title, cover: row.cover || '',
      category: row.category, description: row.description || '',
      file_url: row.file_url || '', external_url: row.external_url || '',
      file_type: row.file_type || '', content: row.content || '',
    })
  } else {
    editingId.value = null
  }
  dialogVisible.value = true
}

const triggerUpload = (type) => {
  if (type === 'cover') coverInput.value?.click()
  if (type === 'file') fileInput.value?.click()
}

const handleCoverUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return
  try { form.cover = await uploadFile(file, 'resource/cover/'); ElMessage.success('封面上传成功') }
  catch { ElMessage.error('上传失败') }
  event.target.value = ''
}

const handleFileUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return
  try {
    form.file_url = await uploadFile(file, 'resource/files/')
    if (form.category === 'video') form.file_type = 'video'
    else if (form.category === 'music') form.file_type = 'audio'
    else if (form.category === 'image') form.file_type = 'image'
    else if (form.category === 'article') form.file_type = 'document'
    else form.file_type = ''
    ElMessage.success('文件上传成功')
  } catch (error) {
    console.error('上传失败:', error)
    ElMessage.error('上传失败: ' + (error?.message || error?.details || '未知错误'))
  }
  event.target.value = ''
}

const handleSave = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  saving.value = true
  try {
    const data = { ...form }; delete data.id
    if (data.category !== 'article') data.content = ''
    if (editingId.value) { await updateResource(editingId.value, data); ElMessage.success('更新成功') }
    else { await createResource(data); ElMessage.success('创建成功') }
    dialogVisible.value = false
    await loadResources()
  } catch (error) { ElMessage.error('保存失败: ' + (error.message || '未知错误')) }
  finally { saving.value = false }
}

const handleDelete = async (row) => {
  await ElMessageBox.confirm(`确定删除资源「${row.title}」吗？`, '确认删除', { type: 'warning', confirmButtonText: '确定删除' })
  try { await deleteResource(row.id); ElMessage.success('删除成功'); await loadResources() }
  catch { ElMessage.error('删除失败') }
}

const loadResources = async () => {
  try {
    const data = await getResources()
    resources.value = data || []
  } catch (error) { ElMessage.error('加载资源列表失败') }
  finally { loading.value = false }
}
</script>

<style lang="scss" scoped>
.resources-manage {
  .rm-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;

    .rm-title {
      font-size: 1.2rem;
      font-weight: 600;
      color: #f1f5f9;
      margin: 0;
    }
  }

  .rm-filter {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 16px;

    .rm-tag {
      cursor: pointer;
      background: rgba(79, 70, 229, 0.05) !important;
      border-color: rgba(79, 70, 229, 0.2) !important;
      color: #94a3b8 !important;

      &:hover {
        background: rgba(79, 70, 229, 0.15) !important;
      }
    }
  }

  .rm-table {
    border-radius: 12px;
    overflow: hidden;

    :deep(.el-table) {
      table-layout: fixed;
    }

    :deep(.el-table__row) {
      background: transparent !important;

      td {
        border-color: rgba(255, 255, 255, 0.04) !important;
        background: rgba(15, 23, 42, 0.5) !important;
      }

      &:hover > td {
        background: rgba(79, 70, 229, 0.08) !important;
      }
    }
  }

  .rm-upload {
    .rm-preview {
      position: relative;
      display: inline-block;

      img {
        width: 100px;
        height: 100px;
        object-fit: cover;
        border-radius: 8px;
      }

      .rm-actions {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        display: flex;
        gap: 4px;
        padding: 4px;
        background: rgba(0, 0, 0, 0.7);
        opacity: 0;
        transition: opacity 0.3s;

        &:hover { opacity: 1; }
      }
    }

    .rm-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 24px;
      border: 2px dashed rgba(79, 70, 229, 0.3);
      border-radius: 8px;
      color: #64748b;
      cursor: pointer;

      &:hover {
        border-color: rgba(79, 70, 229, 0.6);
        color: #818cf8;
      }
    }

    .rm-file-info {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      background: rgba(79, 70, 229, 0.1);
      border-radius: 6px;
      color: #94a3b8;
    }
  }
}
</style>
