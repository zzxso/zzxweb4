# 个人作品集网站 - Supabase + Cloudflare Pages

> 3D 粒子科技风个人展示网站，纯前端 + Supabase 后端，零服务器部署

## 技术栈

- **前端**: Vue 3 + Vite 5 + Vue Router 4 + Pinia + Element Plus
- **3D 粒子**: Three.js（原生 WebGL）
- **图片灯箱**: viewerjs
- **后端**: Supabase（PostgreSQL + Auth + Storage）
- **部署**: Cloudflare Pages

## 快速开始

### 1. 前置准备

```bash
# 安装 Node.js 18+
# 安装 pnpm/yarn/npm
```

### 2. Supabase 项目配置

1. 前往 [supabase.com](https://supabase.com) 创建新项目
2. 复制 **Project URL** 和 **anon/public key**
3. 进入 **SQL Editor**，执行 `supabase/init.sql` 中的全部 SQL
4. 在 **Authentication → Users** 中找到你的用户，点击 Advanced 添加自定义属性：
   ```json
   {"role": "admin"}
   ```
   或在 SQL 中执行：
   ```sql
   UPDATE auth.users
   SET raw_app_meta_data = jsonb_set(raw_app_meta_data, '{role}', '"admin"')
   WHERE email = 'your-email@example.com';
   ```
5. 在 **Storage → New Bucket** 创建 `public-assets` 存储桶（或在 init.sql 中已自动创建）

### 3. 环境变量配置

```bash
# 复制环境变量模板
cp .env.example .env.local

# 编辑 .env.local 填入你的 Supabase 信息
# VITE_SUPABASE_URL=https://xxxx.supabase.co
# VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 访问 http://localhost:5173
```

### 5. Cloudflare Pages 部署

#### 方式一：Git 自动部署（推荐）

1. 将项目推送到 GitHub/GitLab
2. 前往 [Cloudflare Dashboard](https://dash.cloudflare.com) → Pages → Create a project
3. 连接你的代码仓库
4. 配置构建设置：
   - **Framework preset**: Vue
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Environment variables**: 添加 `VITE_SUPABASE_URL` 和 `VITE_SUPABASE_ANON_KEY`
5. 点击 Save and Deploy

#### 方式二：CLI 部署

```bash
# 安装 wrangler CLI
npm install -g wrangler

# 登录 Cloudflare
wrangler login

# 部署
npx cloudflare-pages deploy ./dist --project-name=portfolio
```

## 项目结构

```
personal-website-supabase/
├── src/
│   ├── api/                    # Supabase 业务接口封装
│   │   └── index.js
│   ├── assets/
│   │   └── styles/
│   │       └── global.scss     # 全局样式 & 主题变量
│   ├── components/
│   │   └── ParticleBackground.vue  # 3D 粒子背景
│   ├── layouts/
│   │   ├── FrontLayout.vue     # 前台布局
│   │   └── AdminLayout.vue     # 后台布局
│   ├── router/
│   │   └── index.js            # 路由 & 守卫
│   ├── stores/
│   │   └── user.js             # Pinia 用户状态
│   ├── views/
│   │   ├── front/              # 前台页面
│   │   │   ├── HomeView.vue         # 首页
│   │   │   ├── AboutView.vue        # 关于
│   │   │   ├── ProjectsView.vue     # 项目列表
│   │   │   ├── ProjectDetailView.vue # 项目详情
│   │   │   └── ResourcesView.vue    # 资源列表
│   │   └── admin/              # 后台页面
│   │       ├── LoginView.vue          # 登录
│   │       ├── DashboardView.vue      # 仪表盘
│   │       ├── ProfileView.vue        # 个人资料
│   │       ├── ProjectsManageView.vue # 项目管理
│   │       └── ResourcesManageView.vue# 资源管理
│   ├── utils/
│   │   └── supabase.js         # Supabase 客户端
│   └── App.vue
├── supabase/
│   └── init.sql                # 数据库初始化脚本
├── public/
│   └── favicon.svg
├── index.html
├── package.json
├── vite.config.js
└── .env.local                  # 环境变量（不提交）
```

## 功能清单

### 前台展示

| 模块 | 功能 |
|------|------|
| 首页 | 个人简介、精选项目、技能标签云、联系方式 |
| 关于 | 教育背景时间线、技能进度条、联系方式、简历预览 |
| 项目 | 分类筛选、标签过滤、封面展示、源码/报告链接 |
| 项目详情 | 大图灯箱(viewerjs)、需求说明、源码/报告跳转 |
| 资源 | 分类筛选、文件下载/PDF预览、外链跳转、音视频播放 |

### 后台管理

| 模块 | 功能 |
|------|------|
| 登录 | 邮箱密码登录，Supabase Auth 认证 |
| 个人资料 | 编辑所有字段、头像/简历上传到 Storage |
| 项目管理 | CRUD、封面/多图/报告上传、标签管理 |
| 资源管理 | CRUD、分类筛选、文件上传、外链支持 |

## 数据库表结构

### profile
| 字段 | 类型 | 说明 |
|------|------|------|
| name | TEXT | 姓名 |
| position | TEXT | 职位 |
| avatar | TEXT | 头像 URL |
| resume_image | TEXT | 简历图片 URL |
| education | JSONB | 教育背景数组 |
| bio | TEXT | 个人简介 |
| skills | TEXT[] | 技能标签数组 |
| contact | JSONB | 联系方式对象 |

### projects
| 字段 | 类型 | 说明 |
|------|------|------|
| title | TEXT | 项目名称 |
| cover | TEXT | 封面 URL |
| description | TEXT | 项目描述 |
| requirement | TEXT | 项目需求 |
| tags | TEXT[] | 标签数组 |
| images | TEXT[] | 截图数组 |
| report_url | TEXT | 报告 URL |
| source_url | TEXT | 源代码 URL |

### resources
| 字段 | 类型 | 说明 |
|------|------|------|
| title | TEXT | 资源标题 |
| cover | TEXT | 封面 URL |
| category | TEXT | 分类(tool/tutorial/design/document/other) |
| description | TEXT | 描述 |
| file_url | TEXT | 文件 URL |
| external_url | TEXT | 外链地址 |
| file_type | TEXT | 文件类型(pdf/video/audio/document) |

## 安全说明

- 所有数据表启用了 **RLS（行级安全策略）**
- 前台公开读取，后台仅限管理员写入
- 管理员身份通过 `raw_app_meta_data.role = "admin"` 判定
- Storage 桶配置了同样的读写权限策略

## 浏览器兼容性

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- 移动端自动降级粒子效果（减少粒子数量和连线密度）

## License

MIT
