<template>
  <div class="projects-manage">
    <div class="pm-header">
      <h2 class="pm-title">项目管理</h2>
      <el-button type="primary" @click="openDialog()">
        <el-icon><Plus /></el-icon>
        新增项目
      </el-button>
    </div>

    <el-table :data="projects" v-loading="loading" stripe class="pm-table">
      <el-table-column prop="title" label="项目名称" min-width="150">
        <template #default="{ row }">
          <div class="pm-project-title">
            <img v-if="row.cover" :src="row.cover" class="pm-cover" alt="" />
            <span>{{ row.title }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="tags" label="标签" width="120">
        <template #default="{ row }">
          <el-tag
            v-for="tag in (row.tags || []).slice(0, 3)"
            :key="tag"
            size="small"
            effect="plain"
            class="pm-tag"
          >
            {{ tag }}
          </el-tag>
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
      :title="editingId ? '编辑项目' : '新增项目'"
      :width="isMobile ? '95%' : '700px'"
      top="5vh"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
        <el-form-item label="项目名称" prop="title">
          <el-input v-model="form.title" placeholder="请输入项目名称" />
        </el-form-item>
        <el-form-item label="项目描述" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入项目描述" />
        </el-form-item>
        <el-form-item label="项目需求">
          <el-input v-model="form.requirement" type="textarea" :rows="4" placeholder="请输入项目需求说明" />
        </el-form-item>
        <el-form-item label="标签">
          <el-select v-model="form.tags" multiple filterable allow-create default-first-option placeholder="输入标签后按回车" style="width: 100%" />
        </el-form-item>
        <el-form-item label="封面图片">
          <div class="pm-upload">
            <div class="pm-preview" v-if="form.cover">
              <img :src="form.cover" alt="封面" />
              <div class="pm-actions">
                <el-button size="small" @click="triggerUpload('cover')" type="primary" plain>更换</el-button>
                <el-button size="small" @click="form.cover = ''" type="danger" plain>删除</el-button>
              </div>
            </div>
            <div v-else class="pm-placeholder" @click="triggerUpload('cover')">
              <el-icon :size="24"><Upload /></el-icon>
              <span>点击上传封面</span>
            </div>
            <input ref="coverInput" type="file" accept="image/*" style="display:none" @change="handleCoverUpload" />
          </div>
        </el-form-item>
        <el-form-item label="项目截图">
          <div class="pm-images">
            <div v-for="(img, idx) in form.images" :key="idx" class="pm-img-item">
              <img :src="img" alt="" />
              <el-button class="pm-img-remove" type="danger" size="small" circle @click="form.images.splice(idx, 1)">
                <el-icon><Close /></el-icon>
              </el-button>
            </div>
            <div class="pm-img-add" @click="triggerUpload('images')">
              <el-icon><Plus /></el-icon>
              <span>添加</span>
            </div>
            <input ref="imagesInput" type="file" accept="image/*" multiple style="display:none" @change="handleImagesUpload" />
          </div>
        </el-form-item>
        <el-form-item label="报告文件">
          <div class="pm-upload">
            <div v-if="form.report_url" class="pm-file-info">
              <el-icon><Document /></el-icon>
              <span>已上传</span>
              <el-button size="small" type="danger" text @click="form.report_url = ''">删除</el-button>
            </div>
            <div v-else class="pm-placeholder" @click="triggerUpload('report')">
              <el-icon :size="24"><Upload /></el-icon>
              <span>上传报告</span>
            </div>
            <input ref="reportInput" type="file" style="display:none" @change="handleReportUpload" />
          </div>
        </el-form-item>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="源码地址">
              <el-input v-model="form.source_url" placeholder="https://github.com/..." />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="在线演示">
              <el-input v-model="form.demo_url" placeholder="https://..." />
            </el-form-item>
          </el-col>
        </el-row>
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
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Edit, Delete, Upload, Document, Close } from '@element-plus/icons-vue'
import { getProjects, createProject, updateProject, deleteProject, uploadFile } from '@/api'

const loading = ref(true)
const projects = ref([])
const dialogVisible = ref(false)
const editingId = ref(null)
const formRef = ref(null)
const saving = ref(false)
const coverInput = ref(null)
const imagesInput = ref(null)
const reportInput = ref(null)
const isMobile = ref(false)

const checkMobile = () => { isMobile.value = window.innerWidth <= 768 }

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
  loadProjects()
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})

const defaultForm = {
  title: '', cover: '', description: '', requirement: '',
  tags: [], images: [], report_url: '', source_url: '', demo_url: '',
}

const form = reactive({ ...defaultForm })

const rules = {
  title: [{ required: true, message: '请输入项目名称', trigger: 'blur' }],
  description: [{ required: true, message: '请输入项目描述', trigger: 'blur' }],
}

const resetForm = () => { Object.assign(form, { ...defaultForm }) }

const openDialog = (row) => {
  resetForm()
  if (row) {
    editingId.value = row.id
    Object.assign(form, {
      id: row.id, title: row.title, cover: row.cover || '',
      description: row.description, requirement: row.requirement || '',
      tags: [...(row.tags || [])], images: [...(row.images || [])],
      report_url: row.report_url || '', source_url: row.source_url || '',
      demo_url: row.demo_url || '',
    })
  } else {
    editingId.value = null
  }
  dialogVisible.value = true
}

const triggerUpload = (type) => {
  if (type === 'cover') coverInput.value?.click()
  if (type === 'images') imagesInput.value?.click()
  if (type === 'report') reportInput.value?.click()
}

const handleCoverUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return
  try { form.cover = await uploadFile(file, 'project/cover/'); ElMessage.success('封面上传成功') }
  catch (error) { console.error('上传失败:', error); ElMessage.error('上传失败: ' + (error?.message || error?.details || '未知错误')) }
  event.target.value = ''
}

const handleImagesUpload = async (event) => {
  const files = Array.from(event.target.files)
  for (const file of files) {
    try { form.images.push(await uploadFile(file, 'project/images/')) }
    catch { ElMessage.error(`${file.name} 上传失败`) }
  }
  event.target.value = ''
}

const handleReportUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return
  try { form.report_url = await uploadFile(file, 'project/reports/'); ElMessage.success('报告上传成功') }
  catch (error) { console.error('上传失败:', error); ElMessage.error('上传失败: ' + (error?.message || error?.details || '未知错误')) }
  event.target.value = ''
}

const handleSave = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  saving.value = true
  try {
    const data = { ...form }; delete data.id
    if (editingId.value) { await updateProject(editingId.value, data); ElMessage.success('项目更新成功') }
    else { await createProject(data); ElMessage.success('项目创建成功') }
    dialogVisible.value = false
    await loadProjects()
  } catch (error) { ElMessage.error('保存失败: ' + (error.message || '未知错误')) }
  finally { saving.value = false }
}

const handleDelete = async (row) => {
  await ElMessageBox.confirm(`确定删除项目「${row.title}」吗？此操作不可恢复。`, '确认删除', { type: 'warning', confirmButtonText: '确定删除' })
  try { await deleteProject(row.id); ElMessage.success('删除成功'); await loadProjects() }
  catch { ElMessage.error('删除失败') }
}

const loadProjects = async () => {
  try {
    const data = await getProjects()
    projects.value = data || []
  } catch (error) { ElMessage.error('加载项目列表失败') }
  finally { loading.value = false }
}
</script>

<style lang="scss" scoped>
.projects-manage {
  .pm-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;

    .pm-title {
      font-size: 1.2rem;
      font-weight: 600;
      color: #f1f5f9;
      margin: 0;
    }
  }

  .pm-table {
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

  .pm-project-title {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;

    span {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .pm-cover {
      width: 32px;
      height: 32px;
      border-radius: 6px;
      object-fit: cover;
      flex-shrink: 0;
    }
  }

  .pm-tag { margin-right: 4px; }

  .pm-upload {
    .pm-preview {
      position: relative;
      display: inline-block;

      img {
        width: 100px;
        height: 100px;
        object-fit: cover;
        border-radius: 8px;
      }

      .pm-actions {
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

    .pm-placeholder {
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

    .pm-file-info {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      background: rgba(79, 70, 229, 0.1);
      border-radius: 6px;
      color: #94a3b8;
    }
  }

  .pm-images {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;

    .pm-img-item {
      position: relative;
      width: 80px;
      height: 80px;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 6px;
      }

      .pm-img-remove {
        position: absolute;
        top: -6px;
        right: -6px;
        padding: 0;
        width: 20px;
        height: 20px;
      }
    }

    .pm-img-add {
      width: 60px;
      height: 60px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 4px;
      border: 2px dashed rgba(79, 70, 229, 0.3);
      border-radius: 8px;
      color: #64748b;
      cursor: pointer;

      &:hover {
        border-color: rgba(79, 70, 229, 0.6);
        color: #818cf8;
      }

      .el-icon { font-size: 18px; }
      span { font-size: 0.75rem; }
    }
  }
}
</style>
