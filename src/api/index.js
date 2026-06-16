import { supabase } from '@/utils/supabase'

// 获取个人资料
export async function getProfile() {
  const { data, error } = await supabase
    .from('profile')
    .select('*')
    .single()
  if (error) throw error
  return data
}

// 更新个人资料
export async function updateProfile(updates) {
  const { data, error } = await supabase
    .from('profile')
    .update(updates)
    .select()
    .single()
  if (error) throw error
  return data
}

// 获取项目列表
export async function getProjects() {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

// 获取单个项目
export async function getProject(id) {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

// 创建项目
export async function createProject(project) {
  const { data, error } = await supabase
    .from('projects')
    .insert(project)
    .single()
  if (error) throw error
  return data
}

// 更新项目
export async function updateProject(id, updates) {
  const { data, error } = await supabase
    .from('projects')
    .update(updates)
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

// 删除项目（同时删除 Storage 中的封面图）
export async function deleteProject(id) {
  const { data: project } = await supabase
    .from('projects')
    .select('cover')
    .eq('id', id)
    .single()

  if (project?.cover) {
    try {
      const bucket = import.meta.env.VITE_BUCKET_NAME || 'public-assets'
      const filePath = project.cover.match(/\/([^/]+)$/)?.[1]
      if (filePath) {
        await supabase.storage.from(bucket).remove(['project/covers/' + filePath])
      }
    } catch (e) {
      console.warn('删除封面失败:', e)
    }
  }

  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id)
  if (error) throw error
  return true
}

// 获取资源列表
export async function getResources(category) {
  let query = supabase.from('resources').select('*').order('created_at', { ascending: false })
  if (category) {
    query = query.eq('category', category)
  }
  const { data, error } = await query
  if (error) throw error
  return data
}

// 获取单个资源
export async function getResource(id) {
  const { data, error } = await supabase
    .from('resources')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

// 创建资源
export async function createResource(resource) {
  const { data, error } = await supabase
    .from('resources')
    .insert(resource)
    .single()
  if (error) throw error
  return data
}

// 更新资源
export async function updateResource(id, updates) {
  const { data, error } = await supabase
    .from('resources')
    .update(updates)
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

// 删除资源（同时删除 Storage 中的文件和封面图）
export async function deleteResource(id) {
  const { data: resource } = await supabase
    .from('resources')
    .select('cover, file_url')
    .eq('id', id)
    .single()

  if (resource) {
    try {
      const bucket = import.meta.env.VITE_BUCKET_NAME || 'public-assets'
      const files = []

      if (resource.cover) {
        const name = resource.cover.match(/\/([^/]+)$/)?.[1]
        if (name) files.push('resource/covers/' + name)
      }
      if (resource.file_url) {
        const name = resource.file_url.match(/\/([^/]+)$/)?.[1]
        if (name) files.push('resource/files/' + name)
      }

      if (files.length) {
        await supabase.storage.from(bucket).remove(files)
      }
    } catch (e) {
      console.warn('删除 Storage 文件失败:', e)
    }
  }

  const { error } = await supabase
    .from('resources')
    .delete()
    .eq('id', id)
  if (error) throw error
  return true
}

// 上传文件到 Supabase Storage
export async function uploadFile(file, path) {
  const bucket = import.meta.env.VITE_BUCKET_NAME || 'public-assets'
  // 清理文件名：移除特殊字符，使用 UUID + 扩展名
  const ext = file.name.split('.').pop().toLowerCase()
  const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(path + safeName, file)
  if (uploadError) throw uploadError
  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(path + safeName)
  return urlData.publicUrl
}

// 删除文件
export async function deleteFile(path) {
  const bucket = import.meta.env.VITE_BUCKET_NAME || 'public-assets'
  const { error } = await supabase.storage.from(bucket).remove([path])
  if (error) throw error
  return true
}

// 获取文件公开URL
export function getPublicUrl(path) {
  const bucket = import.meta.env.VITE_BUCKET_NAME || 'public-assets'
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}
