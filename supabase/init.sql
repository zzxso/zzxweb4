-- ============================================
-- 个人作品集网站 - Supabase 数据库初始化脚本
-- 请在 Supabase Dashboard -> SQL Editor 中执行
-- ============================================

-- 1. Profile 表 - 个人资料
CREATE TABLE IF NOT EXISTS profile (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL DEFAULT '张三',
  position TEXT NOT NULL DEFAULT '全栈工程师',
  avatar TEXT DEFAULT '',
  resume_image TEXT DEFAULT '',
  education JSONB DEFAULT '[]'::jsonb,
  bio TEXT DEFAULT '',
  skills TEXT[] DEFAULT '{}',
  contact JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 插入默认资料
INSERT INTO profile (name, position, bio, skills, education, contact)
VALUES (
  '张三',
  '全栈工程师',
  '热爱技术与设计的开发者，专注于构建优雅、高性能的 Web 应用。拥有 5 年以上的开发经验，擅长 Vue、React 等技术栈。',
  ARRAY['Vue.js', 'React', 'TypeScript', 'Node.js', 'Python', 'Three.js', 'Supabase'],
 '[
    {
      "degree": "计算机科学与技术 硕士",
      "school": "某某大学",
      "start_year": 2018,
      "end_year": 2021
    },
    {
      "degree": "软件工程 学士",
      "school": "某某学院",
      "start_year": 2014,
      "end_year": 2018
    }
  ]'::jsonb,
  '{
    "email": "zhangsan@example.com",
    "github": "https://github.com/zhangsan",
    "gitee": "https://gitee.com/zhangsan",
    "wechat": "zhangsan_dev",
    "phone": "138-0000-0000"
  }'::jsonb
)
ON CONFLICT DO NOTHING;

-- 2. Projects 表 - 项目展示
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  cover TEXT DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  requirement TEXT DEFAULT '',
  tags TEXT[] DEFAULT '{}',
  images TEXT[] DEFAULT '{}',
  report_url TEXT DEFAULT '',
  source_url TEXT DEFAULT '',
  demo_url TEXT DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Resources 表 - 资源分享
CREATE TABLE IF NOT EXISTS resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  cover TEXT DEFAULT '',
  category TEXT NOT NULL DEFAULT 'article',
  description TEXT DEFAULT '',
  file_url TEXT DEFAULT '',
  external_url TEXT DEFAULT '',
  file_type TEXT DEFAULT '',
  content TEXT DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 启用 RLS (Row Level Security)
-- ============================================

ALTER TABLE profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Profile 表 RLS 策略
-- ============================================

-- 所有人可读
CREATE POLICY "Anyone can read profile"
  ON profile FOR SELECT
  USING (true);

-- 仅管理员可写（从 JWT 的 app_metadata.role 判断）
CREATE POLICY "Admin can manage profile"
  ON profile FOR ALL
  USING (auth.jwt()->'app_metadata'->>'role' = 'admin');

-- ============================================
-- Projects 表 RLS 策略
-- ============================================

-- 所有人可读
CREATE POLICY "Anyone can read projects"
  ON projects FOR SELECT
  USING (true);

-- 仅管理员可写
CREATE POLICY "Admin can manage projects"
  ON projects FOR ALL
  USING (auth.jwt()->'app_metadata'->>'role' = 'admin');

-- ============================================
-- Resources 表 RLS 策略
-- ============================================

-- 所有人可读
CREATE POLICY "Anyone can read resources"
  ON resources FOR SELECT
  USING (true);

-- 仅管理员可写
CREATE POLICY "Admin can manage resources"
  ON resources FOR ALL
  USING (auth.jwt()->'app_metadata'->>'role' = 'admin');

-- ============================================
-- 创建存储桶
-- ============================================

-- 创建 public-assets 存储桶
INSERT INTO storage.buckets (id, name, public)
VALUES ('public-assets', 'public-assets', true)
ON CONFLICT (id) DO NOTHING;

-- 允许匿名读取
CREATE POLICY "Anyone can read public-assets"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'public-assets');

-- 仅认证用户可以上传（auth.uid() 在 Storage RLS 中可用）
CREATE POLICY "Authenticated users can upload public-assets"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'public-assets' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update public-assets"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'public-assets' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete public-assets"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'public-assets' AND auth.uid() IS NOT NULL);

-- ============================================
-- 设置管理员角色
-- ============================================
-- 方式：在 Supabase Dashboard -> Authentication -> Users 中找到你的用户
-- 然后点击 "Edit" -> "Advanced" -> "Custom attributes" 中添加:
-- {"role": "admin"}
--
-- 或者执行以下 SQL（替换 YOUR_USER_ID）：
-- UPDATE auth.users
-- SET raw_app_meta_data = jsonb_set(raw_app_meta_data, '{role}', '"admin"')
-- WHERE id = 'YOUR_USER_ID';
