# 个人作品集网站部署教程

## 一、准备工作

### 1. 安装 Git

前往 https://git-scm.com/downloads 下载安装 Windows 版本。安装完成后，打开终端确认：

```bash
git --version
```

### 2. 安装 Node.js

确保安装 Node.js 18 或以上版本：

```bash
node -v
npm -v
```

如果未安装，前往 https://nodejs.org 下载安装。

### 3. 注册 Cloudflare 账号

前往 https://dash.cloudflare.com/sign-up 注册免费账号。

### 4. 注册 GitHub 账号

前往 https://github.com 注册账号，用于托管项目代码。

---

## 二、初始化 Git 仓库

将项目目录初始化为 Git 仓库：

```bash
cd D:\aiproject\web4\personal-website-supabase
git init
git add .
git commit -m "initial commit"
```

---

## 三、推送到 GitHub

### 1. 在 GitHub 创建仓库

前往 https://github.com/new，填写仓库名称（如 `zzxweb4`），设为 Public，点击 Create。

### 2. 关联远程仓库并推送

```bash
git remote add origin https://github.com/YOUR_USERNAME/zzxweb4.git
git branch -M master
git push -u origin master
```

> 将 `YOUR_USERNAME` 替换为你的 GitHub 用户名。首次推送需要输入 GitHub 账号和 Personal Access Token。

---

## 四、本地构建测试

在部署前先本地验证构建是否正常：

```bash
npm install
npm run build
```

构建成功后会在项目根目录生成 `dist/` 文件夹。确认无报错后再进行下一步。

---

## 五、部署到 Cloudflare Pages

### 1. 连接 GitHub 仓库

1. 登录 https://dash.cloudflare.com
2. 左侧菜单点击 **Workers & Pages**
3. 点击 **Create application** > **Pages** > **Connect to Git**
4. 授权 Cloudflare 访问你的 GitHub 账号
5. 选择刚才创建的 `zzxweb4` 仓库

### 2. 配置构建设置

在配置页面填写以下参数：

| 配置项 | 值 |
|--------|-----|
| Project name | `zzxweb4`（可自定义） |
| Production branch | `master` |
| Framework preset | **None** |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | （留空） |

### 3. 设置环境变量

在同一个配置页面，展开 **Environment Variables** 部分，添加以下三个变量：

| 变量名 | 值 |
|--------|-----|
| VITE_SUPABASE_URL | `https://sgexeugobwwghrtpiazs.supabase.co` |
| VITE_SUPABASE_ANON_KEY | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`（从项目 `.env.local` 文件中复制完整值） |
| VITE_BUCKET_NAME | `public-assets` |

> **重要**：Cloudflare Pages 要求前端使用的环境变量必须以 `VITE_` 开头，否则构建时不会被注入。

### 4. 开始部署

点击 **Save and Deploy**，Cloudflare 会自动构建并部署你的项目。

部署完成后会获得一个域名，形如：

```
https://zzxweb4.pages.dev
```

---

## 六、验证部署

1. 访问 `https://zzxweb4.pages.dev` 确认前台页面正常显示
2. 访问 `https://zzxweb4.pages.dev/#/about` 确认个人介绍页正常
3. 访问 `https://zzxweb4.pages.dev/#/admin/login` 确认管理后台可访问
4. 在手机上打开上述链接，确认移动端显示正常

---

## 七、Supabase 后端配置

### 1. 数据库初始化

登录 https://supabase.com/dashboard，找到你的项目 `sgexeugobwwghrtpiazs`，进入 **SQL Editor**，将 `supabase/init.sql` 文件的内容粘贴进去执行。

### 2. 设置管理员角色

1. 进入 **Authentication** > **Users**
2. 找到你的用户，点击 **Edit** > **Advanced**
3. 在 **Raw app metadata** 中添加：

```json
{"role": "admin"}
```

4. 保存

### 3. 确认 Storage Bucket

进入 **Storage**，确认 `public-assets` 存储桶已创建，且以下策略已生效：

- Anyone can read public-assets（SELECT）
- Authenticated users can upload public-assets（INSERT）
- Authenticated users can update public-assets（UPDATE）
- Authenticated users can delete public-assets（DELETE）

---

## 八、自动部署

由于已连接 GitHub，此后每次推送代码到 `master` 分支，Cloudflare Pages 会自动构建并部署最新版本。

```bash
git add .
git commit -m "update: xxx"
git push
```

等待 1-2 分钟，Cloudflare 会自动完成部署。

---

## 九、自定义域名（可选）

1. 在 Cloudflare Pages 项目中点击 **Custom domains**
2. 点击 **Set up a custom domain**
3. 输入你的域名（如 `www.zzx.com`）
4. 按照提示在域名 DNS 提供商处添加 CNAME 记录

---

## 十、常见问题

### Q: 部署后页面空白

检查浏览器控制台（F12）是否有错误。常见原因：
- 环境变量未正确设置，确认 `VITE_SUPABASE_URL` 和 `VITE_SUPABASE_ANON_KEY` 已添加
- 环境变量值中包含引号，删除引号后重新部署

### Q: 管理后台无法登录

确认用户已在 Supabase 创建，且 `raw_app_meta_data` 中设置了 `{"role": "admin"}`。

### Q: 文件上传失败

确认 Storage bucket `public-assets` 的 RLS 策略已生效。可在 Supabase Dashboard > Storage > Policies 中查看。

### Q: 如何回滚到上一个版本

在 Cloudflare Pages 的 Deployments 页面，找到之前成功的部署记录，点击右侧菜单 > **Promote** 即可上线。

---

## 附录：项目目录结构

```
personal-website-supabase/
├── .env.local              # Supabase 凭证（不提交到 Git）
├── .gitignore              # Git 忽略规则
├── package.json            # 项目依赖
├── vite.config.js          # Vite 构建配置
├── index.html              # 入口 HTML
├── public/                 # 静态资源
├── src/                    # 源代码
│   ├── api/                # API 接口
│   ├── assets/             # 样式和资源
│   ├── layouts/            # 布局组件
│   ├── router/             # 路由配置
│   ├── stores/             # Pinia 状态管理
│   ├── utils/              # 工具函数
│   ├── views/              # 页面视图
│   │   ├── front/          # 前台页面
│   │   └── admin/          # 管理后台页面
│   ├── App.vue             # 根组件
│   └── main.js             # 入口文件
└── supabase/
    └── init.sql            # 数据库初始化脚本
```

## 附录：Supabase 免费套餐限制

| 项目 | 限额 |
|------|------|
| 数据库行数 | 无限制 |
| 存储空间 | 1 GB |
| 月活跃用户 | 50,000 |
| 月 API 请求 | 无限制 |
| 月带宽 | 无限制 |

**1 GB 存储建议分配：**

| 文件类型 | 单文件大小 | 可存储数量 |
|----------|-----------|-----------|
| 封面图/截图 | 200 KB | 约 5000 张 |
| PDF 报告 | 5 MB | 约 200 个 |
| 视频 | 50 MB | 约 20 个 |

建议视频和大型文件使用外部链接（B 站、网盘等）代替直接上传。
