# Pilbum

A modern, self-hosted photo album system built for photography enthusiasts.

[中文文档](./README.zh-CN.md)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fcailurus%2FPilbum&project-name=pilbum&repository-name=pilbum)

## Introduction

Pilbum is a lightweight, self-hosted photo management platform. Keep full control of your photos with original quality, complete EXIF data, and Live Photo support — no compression, no ads, no third-party dependencies.

**Perfect for**: Photography portfolios, family albums, client deliveries, and anyone who values data privacy.

## Features

- **Live Photo Support** - Auto-pairs iOS Live Photos, hover to play animations
- **EXIF Display** - Camera model, lens, aperture, shutter speed, ISO, GPS location
- **Masonry Gallery** - Responsive layout with infinite scroll
- **Dark Mode** - System-aware automatic theme switching
- **Multi-language** - English and Chinese support
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

---

## Quick Start

### Option 1: Vercel (Recommended)

1. Click the **Deploy with Vercel** button above
2. Follow the setup wizard to configure database and storage
3. Visit `/admin` to manage your photos

### Option 2: Local Development

```bash
git clone https://github.com/cailurus/Pilbum.git
cd Pilbum
cp .env.example .env
npm install
npm run dev
```

Visit `http://localhost:3000/admin` (default password: `admin`)

---

## Configuration

Pilbum needs two services: a **database** and **object storage**.

| Service | Local (Default) | Cloud (Recommended) |
|---------|-----------------|---------------------|
| Database | SQLite | [Supabase](https://supabase.com) (free 500MB) |
| Storage | Local filesystem | [Cloudflare R2](https://www.cloudflare.com/products/r2/) (free 10GB) |

### Database

**Local SQLite** (no config needed):
```bash
DATABASE_PROVIDER=local
```

**Supabase PostgreSQL**:
```bash
DATABASE_PROVIDER=postgres
DATABASE_URL=postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
```

> Get your connection string: Supabase Dashboard → Settings → Database → Connection string (URI)

<details>
<summary>Other database options</summary>

- **[Neon](https://neon.tech)** - Serverless PostgreSQL
- **[Railway](https://railway.app)** - Easy PostgreSQL hosting
- **[Vercel Postgres](https://vercel.com/storage/postgres)** - Integrated with Vercel

</details>

### Object Storage

**Local filesystem** (no config needed):
```bash
STORAGE_PROVIDER=local
```

**Cloudflare R2**:
```bash
STORAGE_PROVIDER=s3
S3_ENDPOINT=https://[account-id].r2.cloudflarestorage.com
S3_BUCKET=pilbum-photos
S3_ACCESS_KEY_ID=your-access-key
S3_SECRET_ACCESS_KEY=your-secret-key
S3_REGION=auto
NEXT_PUBLIC_STORAGE_BASE_URL=https://pub-[hash].r2.dev
```

> Setup: R2 Dashboard → Create bucket → Manage API Tokens → Create token with Object Read & Write

<details>
<summary>Other storage options</summary>

- **[AWS S3](https://aws.amazon.com/s3/)** - Industry standard
- **[Supabase Storage](https://supabase.com/storage)** - Unified with Supabase DB
- **[Azure Blob](https://azure.microsoft.com/products/storage/blobs)** - Microsoft cloud

</details>

### Full Example

```bash
# Database
DATABASE_PROVIDER=postgres
DATABASE_URL=postgresql://postgres.[ref]:[password]@aws-0-us-east-1.pooler.supabase.com:6543/postgres

# Storage
STORAGE_PROVIDER=s3
S3_ENDPOINT=https://[account-id].r2.cloudflarestorage.com
S3_BUCKET=pilbum-photos
S3_ACCESS_KEY_ID=your-key
S3_SECRET_ACCESS_KEY=your-secret
S3_REGION=auto
NEXT_PUBLIC_STORAGE_BASE_URL=https://your-domain.com

# Auth
ADMIN_DEFAULT_PASSWORD=change-this-password
```

> For detailed configuration guides, see [docs/storage-configuration.md](./docs/storage-configuration.md)

---

## Updating

When deploying via Vercel, a fork of this repository is created in your GitHub account. To get updates:

### GitHub Web (Easiest)

1. Go to your forked repository on GitHub
2. You'll see "This branch is X commits behind cailurus/Pilbum:main"
3. Click **Sync fork** → **Update branch**
4. Vercel will automatically redeploy

### Command Line

```bash
# Add upstream (one-time)
git remote add upstream https://github.com/cailurus/Pilbum.git

# Sync updates
git fetch upstream
git merge upstream/main
git push origin main
```

---

## Deployment Options

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
