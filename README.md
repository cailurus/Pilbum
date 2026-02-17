# Pilbum

A modern, self-hosted photo album system built for photography enthusiasts.

[中文文档](./README.zh-CN.md)

## Introduction

Pilbum is a lightweight, self-hosted photo management and showcase platform. It gives you full control over your photo data without relying on third-party cloud services, while providing a professional-grade photo viewing experience.

### Problems It Solves

- **Data Privacy**: Photos are stored on your own server - no worries about privacy leaks or service shutdowns
- **Professional Display**: Unlike social platforms that compress and crop, preserves original quality and complete EXIF data
- **Live Photo Support**: Full support for iOS Live Photo upload and playback - a feature most album services lack
- **Clean Experience**: Focus on the photos themselves, no ads, social features, or cluttered interfaces

### Use Cases

- Personal photography portfolio
- Private family photo storage
- Photographers delivering work to clients
- Travel and life photo archiving

### Target Users

- Privacy-conscious users who want control over their data
- Photography enthusiasts who need to showcase their portfolio
- Technical users with basic server management skills
- Families wanting to build a private cloud album

## Features

- **Live Photo Support** - Auto-pairs iOS Live Photos, hover to play animations
- **EXIF Display** - Camera model, lens, aperture, shutter speed, ISO, GPS location
- **Masonry Gallery** - Responsive layout with infinite scroll
- **Dark Mode** - System-aware automatic theme switching
- **Multi-language** - Internationalization with next-intl
- **Admin Dashboard** - Photo upload, batch management, user permissions
- **Auto-Update Detection** - Check for new versions from GitHub releases

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 15 (App Router) |
| Database | SQLite (local) / PostgreSQL (cloud) |
| ORM | Drizzle |
| Styling | Tailwind CSS |
| Auth | Iron Session |
| Image Processing | Sharp |
| Maps | Leaflet + OpenStreetMap |

## Quick Start

1. Clone the repository
2. Copy `.env.example` to `.env` and configure
3. Install dependencies: `npm install`
4. Initialize database: `npm run db:migrate`
5. Start dev server: `npm run dev`
6. Visit `http://localhost:3000/admin` to manage

---

## Storage Configuration

Pilbum requires two types of storage:

| Type | Purpose | Default | Cloud Options |
|------|---------|---------|---------------|
| **Database** | Photo metadata, users, settings | SQLite (local) | PostgreSQL |
| **Object Storage** | Image files, thumbnails, videos | Local filesystem | S3-compatible, Azure Blob |

---

## Database Configuration

### Option 1: Local SQLite (Default)

No configuration needed. Data is stored in `./data/sqlite.db`.

```bash
# .env
DATABASE_PROVIDER=local
```

### Option 2: Supabase (Recommended for Cloud)

[Supabase](https://supabase.com) offers a generous free tier with 500MB database storage.

**Setup Steps:**

1. Go to [supabase.com](https://supabase.com) and sign up
2. Click "New Project" and create a project
3. Wait for the project to initialize (~2 minutes)
4. Go to **Settings** → **Database**
5. Find "Connection string" section, select "URI"
6. Copy the connection string (starts with `postgresql://`)

**Configuration:**

```bash
# .env
DATABASE_PROVIDER=postgres
DATABASE_URL=postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
```

> **Note**: Replace `[password]` with your database password set during project creation.

### Option 3: Neon

[Neon](https://neon.tech) offers serverless PostgreSQL with a free tier.

**Setup Steps:**

1. Go to [neon.tech](https://neon.tech) and sign up
2. Click "Create Project"
3. Copy the connection string from the dashboard

**Configuration:**

```bash
# .env
DATABASE_PROVIDER=postgres
DATABASE_URL=postgresql://[user]:[password]@[endpoint].neon.tech/[database]?sslmode=require
```

### Option 4: Railway

[Railway](https://railway.app) provides easy PostgreSQL hosting.

**Setup Steps:**

1. Go to [railway.app](https://railway.app) and sign up
2. Click "New Project" → "Provision PostgreSQL"
3. Click on the database → "Connect" tab
4. Copy the "Postgres Connection URL"

**Configuration:**

```bash
# .env
DATABASE_PROVIDER=postgres
DATABASE_URL=postgresql://postgres:[password]@[host].railway.app:5432/railway
```

### Option 5: Vercel Postgres

If deploying on Vercel, use their integrated Postgres.

**Setup Steps:**

1. In your Vercel project, go to "Storage" tab
2. Click "Create Database" → "Postgres"
3. Follow the setup wizard
4. Environment variables are auto-configured

---

## Object Storage Configuration

### Option 1: Local Storage (Default)

Files are stored in `./public/uploads/`. Suitable for development and small deployments.

```bash
# .env
STORAGE_PROVIDER=local
LOCAL_STORAGE_PATH=public/uploads
```

### Option 2: Cloudflare R2 (Recommended)

[Cloudflare R2](https://www.cloudflare.com/products/r2/) offers S3-compatible storage with no egress fees.

**Free Tier:** 10GB storage, 10 million reads/month, 1 million writes/month

**Setup Steps:**

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com) and sign up
2. Navigate to **R2 Object Storage**
3. Click "Create bucket", name it (e.g., `pilbum-photos`)
4. Go to **R2** → **Overview** → **Manage R2 API Tokens**
5. Click "Create API Token"
   - Permissions: **Object Read & Write**
   - Specify bucket: Select your bucket
6. Copy the **Access Key ID** and **Secret Access Key**
7. Note your **Account ID** from the R2 overview page

**Configuration:**

```bash
# .env
STORAGE_PROVIDER=s3
S3_ENDPOINT=https://[account-id].r2.cloudflarestorage.com
S3_BUCKET=pilbum-photos
S3_ACCESS_KEY_ID=your-access-key-id
S3_SECRET_ACCESS_KEY=your-secret-access-key
S3_REGION=auto

# Public access URL (configure custom domain or use R2.dev subdomain)
NEXT_PUBLIC_STORAGE_BASE_URL=https://pub-[hash].r2.dev
```

**Enable Public Access:**

1. In your bucket settings, go to "Settings"
2. Enable "R2.dev subdomain" for public access
3. Or configure a custom domain for better URLs

### Option 3: AWS S3

[Amazon S3](https://aws.amazon.com/s3/) is the industry standard for object storage.

**Setup Steps:**

1. Go to [AWS Console](https://console.aws.amazon.com) and sign up
2. Navigate to **S3** → "Create bucket"
3. Name your bucket (e.g., `pilbum-photos`)
4. Region: Choose one close to your users
5. Uncheck "Block all public access" (for public photo URLs)
6. Create the bucket

**Create IAM Credentials:**

1. Go to **IAM** → **Users** → "Create user"
2. Attach policy: `AmazonS3FullAccess` (or create a custom policy)
3. Go to "Security credentials" → "Create access key"
4. Copy the **Access Key ID** and **Secret Access Key**

**Configuration:**

```bash
# .env
STORAGE_PROVIDER=s3
S3_ENDPOINT=https://s3.[region].amazonaws.com
S3_BUCKET=pilbum-photos
S3_ACCESS_KEY_ID=AKIA...
S3_SECRET_ACCESS_KEY=your-secret-key
S3_REGION=us-east-1

NEXT_PUBLIC_STORAGE_BASE_URL=https://pilbum-photos.s3.us-east-1.amazonaws.com
```

### Option 4: Supabase Storage

Use Supabase Storage alongside Supabase Database for a unified solution.

**Setup Steps:**

1. In your Supabase project, go to **Storage**
2. Click "New bucket", name it `photos`
3. Set bucket to **Public** (for photo URLs)
4. Go to **Settings** → **API**
5. Copy your **Project URL** and **anon public key**

**Configuration:**

```bash
# .env
STORAGE_PROVIDER=supabase
SUPABASE_URL=https://[project-ref].supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_BUCKET=photos

NEXT_PUBLIC_STORAGE_BASE_URL=https://[project-ref].supabase.co/storage/v1/object/public/photos
```

### Option 5: Azure Blob Storage

[Azure Blob Storage](https://azure.microsoft.com/en-us/products/storage/blobs) is Microsoft's object storage solution.

**Setup Steps:**

1. Go to [Azure Portal](https://portal.azure.com) and sign up
2. Create a **Storage Account**
3. Go to your storage account → **Containers**
4. Create a container named `photos` with "Blob" public access level
5. Go to **Access keys** and copy the **Connection string**

**Configuration:**

```bash
# .env
STORAGE_PROVIDER=azure
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=...
AZURE_STORAGE_CONTAINER_NAME=photos

NEXT_PUBLIC_STORAGE_BASE_URL=https://[account-name].blob.core.windows.net/photos
```

---

## Complete Configuration Example

Here's a complete `.env` example using Supabase (Database) + Cloudflare R2 (Storage):

```bash
# Database - Supabase
DATABASE_PROVIDER=postgres
DATABASE_URL=postgresql://postgres.[ref]:[password]@aws-0-us-east-1.pooler.supabase.com:6543/postgres

# Storage - Cloudflare R2
STORAGE_PROVIDER=s3
S3_ENDPOINT=https://[account-id].r2.cloudflarestorage.com
S3_BUCKET=pilbum-photos
S3_ACCESS_KEY_ID=your-access-key
S3_SECRET_ACCESS_KEY=your-secret-key
S3_REGION=auto
NEXT_PUBLIC_STORAGE_BASE_URL=https://your-custom-domain.com

# Auth
ADMIN_DEFAULT_PASSWORD=change-this-password

# App
NEXT_PUBLIC_DEFAULT_LOCALE=en
```

---

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables in project settings
4. Deploy

### Docker

```bash
docker build -t pilbum .
docker run -p 3000:3000 --env-file .env pilbum
```

### Traditional VPS

```bash
npm install
npm run build
npm start
```

---

## License

MIT
