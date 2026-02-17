# Pilbum

一个现代化的自托管个人相册系统，专为摄影爱好者打造。

[English](./README.md)

## 项目介绍

Pilbum 是一个轻量级、可自托管的照片管理和展示平台。它让你能够完全掌控自己的照片数据，无需依赖第三方云服务，同时提供专业级的照片展示体验。

### 解决什么问题

- **数据隐私**：照片存储在自己的服务器上，无需担心隐私泄露或服务商跑路
- **专业展示**：不同于社交平台的压缩和裁剪，保留照片原始质量和完整 EXIF 信息
- **Live Photo 支持**：完整支持 iOS Live Photo 的上传和播放，这是大多数相册服务不具备的功能
- **简洁体验**：专注于照片本身，没有广告、社交功能或复杂的界面干扰

### 适用场景

- 个人摄影作品集展示
- 家庭照片私有化存储
- 摄影师向客户交付作品
- 旅行/生活照片归档

### 面向人群

- 注重隐私、希望自己掌控数据的用户
- 需要展示作品集的摄影爱好者
- 有基本服务器运维能力的技术用户
- 想要搭建家庭私有云相册的用户

## 功能特性

- **Live Photo 支持** - 自动配对 iOS Live Photo，悬停播放动态效果
- **EXIF 信息展示** - 相机型号、镜头、光圈、快门、ISO、GPS 位置
- **瀑布流画廊** - 响应式布局，无限滚动加载
- **深色模式** - 跟随系统自动切换主题
- **多语言支持** - 基于 next-intl 的国际化
- **管理后台** - 照片上传、批量管理、用户权限控制
- **自动更新检测** - 从 GitHub Releases 检查新版本

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Next.js 15 (App Router) |
| 数据库 | SQLite (本地) / PostgreSQL (云端) |
| ORM | Drizzle |
| 样式 | Tailwind CSS |
| 认证 | Iron Session |
| 图片处理 | Sharp |
| 地图 | Leaflet + OpenStreetMap |

## 快速开始

1. 克隆仓库
2. 复制 `.env.example` 为 `.env` 并配置
3. 安装依赖：`npm install`
4. 初始化数据库：`npm run db:migrate`
5. 启动开发服务器：`npm run dev`
6. 访问 `http://localhost:3000/admin` 进行管理

---

## 存储配置

Pilbum 需要两种类型的存储：

| 类型 | 用途 | 默认选项 | 云端选项 |
|------|------|----------|----------|
| **数据库** | 照片元数据、用户、设置 | SQLite (本地) | PostgreSQL |
| **对象存储** | 图片文件、缩略图、视频 | 本地文件系统 | S3 兼容存储、Azure Blob |

---

## 数据库配置

### 方案一：本地 SQLite（默认）

无需额外配置，数据存储在 `./data/sqlite.db`。

```bash
# .env
DATABASE_PROVIDER=local
```

### 方案二：Supabase（推荐云端方案）

[Supabase](https://supabase.com) 提供慷慨的免费额度，包含 500MB 数据库存储。

**配置步骤：**

1. 访问 [supabase.com](https://supabase.com) 并注册账号
2. 点击 "New Project" 创建新项目
3. 等待项目初始化（约 2 分钟）
4. 进入 **Settings** → **Database**
5. 找到 "Connection string" 部分，选择 "URI"
6. 复制连接字符串（以 `postgresql://` 开头）

**环境变量配置：**

```bash
# .env
DATABASE_PROVIDER=postgres
DATABASE_URL=postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
```

> **注意**：将 `[password]` 替换为创建项目时设置的数据库密码。

### 方案三：Neon

[Neon](https://neon.tech) 提供 Serverless PostgreSQL，有免费额度。

**配置步骤：**

1. 访问 [neon.tech](https://neon.tech) 并注册
2. 点击 "Create Project" 创建项目
3. 从控制台复制连接字符串

**环境变量配置：**

```bash
# .env
DATABASE_PROVIDER=postgres
DATABASE_URL=postgresql://[user]:[password]@[endpoint].neon.tech/[database]?sslmode=require
```

### 方案四：Railway

[Railway](https://railway.app) 提供简单易用的 PostgreSQL 托管服务。

**配置步骤：**

1. 访问 [railway.app](https://railway.app) 并注册
2. 点击 "New Project" → "Provision PostgreSQL"
3. 点击数据库 → "Connect" 标签页
4. 复制 "Postgres Connection URL"

**环境变量配置：**

```bash
# .env
DATABASE_PROVIDER=postgres
DATABASE_URL=postgresql://postgres:[password]@[host].railway.app:5432/railway
```

### 方案五：Vercel Postgres

如果部署在 Vercel，可以使用其集成的 Postgres 服务。

**配置步骤：**

1. 在 Vercel 项目中，进入 "Storage" 标签页
2. 点击 "Create Database" → "Postgres"
3. 按向导完成设置
4. 环境变量会自动配置

---

## 对象存储配置

### 方案一：本地存储（默认）

文件存储在 `./public/uploads/`，适合开发环境和小型部署。

```bash
# .env
STORAGE_PROVIDER=local
LOCAL_STORAGE_PATH=public/uploads
```

### 方案二：Cloudflare R2（推荐）

[Cloudflare R2](https://www.cloudflare.com/zh-cn/products/r2/) 提供 S3 兼容的对象存储，**无出口流量费用**。

**免费额度**：10GB 存储、每月 1000 万次读取、100 万次写入

**配置步骤：**

1. 访问 [Cloudflare 控制台](https://dash.cloudflare.com) 并注册
2. 导航到 **R2 对象存储**
3. 点击 "创建存储桶"，命名（如 `pilbum-photos`）
4. 进入 **R2** → **概述** → **管理 R2 API 令牌**
5. 点击 "创建 API 令牌"
   - 权限：**对象读写**
   - 指定存储桶：选择你的存储桶
6. 复制 **访问密钥 ID** 和 **机密访问密钥**
7. 从 R2 概述页面记下你的 **账户 ID**

**环境变量配置：**

```bash
# .env
STORAGE_PROVIDER=s3
S3_ENDPOINT=https://[account-id].r2.cloudflarestorage.com
S3_BUCKET=pilbum-photos
S3_ACCESS_KEY_ID=你的访问密钥ID
S3_SECRET_ACCESS_KEY=你的机密访问密钥
S3_REGION=auto

# 公开访问 URL（配置自定义域名或使用 R2.dev 子域名）
NEXT_PUBLIC_STORAGE_BASE_URL=https://pub-[hash].r2.dev
```

**启用公开访问：**

1. 在存储桶设置中，进入 "设置"
2. 启用 "R2.dev 子域名" 以获得公开访问
3. 或者配置自定义域名以获得更好的 URL

### 方案三：AWS S3

[Amazon S3](https://aws.amazon.com/cn/s3/) 是行业标准的对象存储服务。

**配置步骤：**

1. 访问 [AWS 控制台](https://console.aws.amazon.com) 并注册
2. 导航到 **S3** → "创建存储桶"
3. 命名存储桶（如 `pilbum-photos`）
4. 区域：选择离用户较近的区域
5. 取消勾选 "阻止所有公开访问"（用于公开照片 URL）
6. 创建存储桶

**创建 IAM 凭证：**

1. 进入 **IAM** → **用户** → "创建用户"
2. 附加策略：`AmazonS3FullAccess`（或创建自定义策略）
3. 进入 "安全凭证" → "创建访问密钥"
4. 复制 **访问密钥 ID** 和 **私有访问密钥**

**环境变量配置：**

```bash
# .env
STORAGE_PROVIDER=s3
S3_ENDPOINT=https://s3.[region].amazonaws.com
S3_BUCKET=pilbum-photos
S3_ACCESS_KEY_ID=AKIA...
S3_SECRET_ACCESS_KEY=你的私有密钥
S3_REGION=us-east-1

NEXT_PUBLIC_STORAGE_BASE_URL=https://pilbum-photos.s3.us-east-1.amazonaws.com
```

### 方案四：Supabase Storage

与 Supabase 数据库配合使用，提供一体化解决方案。

**配置步骤：**

1. 在 Supabase 项目中，进入 **Storage**
2. 点击 "New bucket"，命名为 `photos`
3. 设置存储桶为 **Public**（用于公开照片 URL）
4. 进入 **Settings** → **API**
5. 复制 **Project URL** 和 **anon public key**

**环境变量配置：**

```bash
# .env
STORAGE_PROVIDER=supabase
SUPABASE_URL=https://[project-ref].supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_BUCKET=photos

NEXT_PUBLIC_STORAGE_BASE_URL=https://[project-ref].supabase.co/storage/v1/object/public/photos
```

### 方案五：Azure Blob Storage

[Azure Blob Storage](https://azure.microsoft.com/zh-cn/products/storage/blobs) 是微软的对象存储解决方案。

**配置步骤：**

1. 访问 [Azure 门户](https://portal.azure.com) 并注册
2. 创建 **存储帐户**
3. 进入存储帐户 → **容器**
4. 创建名为 `photos` 的容器，访问级别设为 "Blob"
5. 进入 **访问密钥**，复制 **连接字符串**

**环境变量配置：**

```bash
# .env
STORAGE_PROVIDER=azure
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=...
AZURE_STORAGE_CONTAINER_NAME=photos

NEXT_PUBLIC_STORAGE_BASE_URL=https://[account-name].blob.core.windows.net/photos
```

---

## 完整配置示例

以下是使用 Supabase（数据库）+ Cloudflare R2（存储）的完整 `.env` 示例：

```bash
# 数据库 - Supabase
DATABASE_PROVIDER=postgres
DATABASE_URL=postgresql://postgres.[ref]:[password]@aws-0-us-east-1.pooler.supabase.com:6543/postgres

# 存储 - Cloudflare R2
STORAGE_PROVIDER=s3
S3_ENDPOINT=https://[account-id].r2.cloudflarestorage.com
S3_BUCKET=pilbum-photos
S3_ACCESS_KEY_ID=你的访问密钥
S3_SECRET_ACCESS_KEY=你的机密密钥
S3_REGION=auto
NEXT_PUBLIC_STORAGE_BASE_URL=https://your-custom-domain.com

# 认证
ADMIN_DEFAULT_PASSWORD=修改为你的密码

# 应用
NEXT_PUBLIC_DEFAULT_LOCALE=zh
```

---

## 部署

### Vercel（推荐）

1. 将代码推送到 GitHub
2. 在 [Vercel](https://vercel.com) 导入项目
3. 在项目设置中添加环境变量
4. 部署

### Docker

```bash
docker build -t pilbum .
docker run -p 3000:3000 --env-file .env pilbum
```

### 传统 VPS

```bash
npm install
npm run build
npm start
```

---

## License

MIT
