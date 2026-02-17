# Pilbum

一个现代化的自托管个人相册系统，专为摄影爱好者打造。

[English](./README.md)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fcailurus%2FPilbum&project-name=pilbum&repository-name=pilbum)

## 项目介绍

Pilbum 是一个轻量级、可自托管的照片管理平台。完全掌控你的照片数据，保留原始画质、完整 EXIF 信息和 Live Photo 支持 — 无压缩、无广告、无第三方依赖。

**适用于**：摄影作品集、家庭相册、客户交付、以及所有注重数据隐私的用户。

## 功能特性

- **Live Photo 支持** - 自动配对 iOS Live Photo，悬停播放动态效果
- **EXIF 信息展示** - 相机型号、镜头、光圈、快门、ISO、GPS 位置
- **瀑布流画廊** - 响应式布局，无限滚动加载
- **深色模式** - 跟随系统自动切换主题
- **多语言支持** - 中英双语
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

---

## 快速开始

### 方式一：Vercel 部署（推荐）

1. 点击上方 **Deploy with Vercel** 按钮
2. 按照配置向导设置数据库和存储
3. 访问 `/admin` 管理照片

### 方式二：本地开发

```bash
git clone https://github.com/cailurus/Pilbum.git
cd Pilbum
cp .env.example .env
npm install
npm run dev
```

访问 `http://localhost:3000/admin`（默认密码：`admin`）

---

## 配置说明

Pilbum 需要两个服务：**数据库** 和 **对象存储**。

| 服务 | 本地（默认） | 云端（推荐） |
|------|-------------|-------------|
| 数据库 | SQLite | [Supabase](https://supabase.com)（免费 500MB） |
| 存储 | 本地文件系统 | [Cloudflare R2](https://www.cloudflare.com/zh-cn/products/r2/)（免费 10GB） |

### 数据库

**本地 SQLite**（无需配置）：
```bash
DATABASE_PROVIDER=local
```

**Supabase PostgreSQL**：
```bash
DATABASE_PROVIDER=postgres
DATABASE_URL=postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
```

> 获取连接字符串：Supabase 控制台 → Settings → Database → Connection string (URI)

<details>
<summary>其他数据库选项</summary>

- **[Neon](https://neon.tech)** - Serverless PostgreSQL
- **[Railway](https://railway.app)** - 简单易用的 PostgreSQL
- **[Vercel Postgres](https://vercel.com/storage/postgres)** - Vercel 集成

</details>

### 对象存储

**本地文件系统**（无需配置）：
```bash
STORAGE_PROVIDER=local
```

**Cloudflare R2**：
```bash
STORAGE_PROVIDER=s3
S3_ENDPOINT=https://[account-id].r2.cloudflarestorage.com
S3_BUCKET=pilbum-photos
S3_ACCESS_KEY_ID=你的访问密钥
S3_SECRET_ACCESS_KEY=你的机密密钥
S3_REGION=auto
NEXT_PUBLIC_STORAGE_BASE_URL=https://pub-[hash].r2.dev
```

> 配置步骤：R2 控制台 → 创建存储桶 → 管理 API 令牌 → 创建对象读写权限的令牌

<details>
<summary>其他存储选项</summary>

- **[AWS S3](https://aws.amazon.com/cn/s3/)** - 行业标准
- **[Supabase Storage](https://supabase.com/storage)** - 与 Supabase 数据库统一
- **[Azure Blob](https://azure.microsoft.com/zh-cn/products/storage/blobs)** - 微软云存储

</details>

### 完整配置示例

```bash
# 数据库
DATABASE_PROVIDER=postgres
DATABASE_URL=postgresql://postgres.[ref]:[password]@aws-0-us-east-1.pooler.supabase.com:6543/postgres

# 存储
STORAGE_PROVIDER=s3
S3_ENDPOINT=https://[account-id].r2.cloudflarestorage.com
S3_BUCKET=pilbum-photos
S3_ACCESS_KEY_ID=你的密钥
S3_SECRET_ACCESS_KEY=你的机密
S3_REGION=auto
NEXT_PUBLIC_STORAGE_BASE_URL=https://your-domain.com

# 认证
ADMIN_DEFAULT_PASSWORD=修改为你的密码
```

> 详细配置指南请参考 [docs/storage-configuration.md](./docs/storage-configuration.md)

---

## 更新指南

通过 Vercel 部署时，会在你的 GitHub 账户下创建一个 fork 仓库。获取更新的方法：

### GitHub 网页端（最简单）

1. 访问你 fork 的仓库页面
2. 会看到提示 "This branch is X commits behind cailurus/Pilbum:main"
3. 点击 **Sync fork** → **Update branch**
4. Vercel 会自动重新部署

### 命令行方式

```bash
# 添加上游仓库（仅需一次）
git remote add upstream https://github.com/cailurus/Pilbum.git

# 同步更新
git fetch upstream
git merge upstream/main
git push origin main
```

---

## 其他部署方式

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
