# Vercel Setup Wizard Design

## Overview

This document describes the design for a setup wizard that guides users through configuring their Pilbum deployment after one-click deploy to Vercel.

## Problem Statement

When users deploy Pilbum to Vercel using one-click deploy, they need to configure:
1. A PostgreSQL database (Supabase recommended)
2. Object storage (Cloudflare R2 recommended)

Currently, this requires manual environment variable configuration without guidance. This feature adds an in-app setup wizard to guide users through the process.

## Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Database provider | Supabase | 500MB free tier, friendly UI, good docs |
| Storage provider | Cloudflare R2 | 10GB free, no egress fees |
| Detection approach | Step-by-step | DB required first, storage can be added later |
| No-DB handling | Static page | Simple, reliable, no database needed |
| Language support | Bilingual (en/zh) | Matches existing app i18n |
| Content format | Text + copy buttons + links | No screenshots (may become outdated) |

## Architecture

```
User clicks Deploy to Vercel
         ↓
    Vercel deployment complete
         ↓
    First visit to app
         ↓
┌─────────────────────────────────┐
│  Check DATABASE_URL env var     │
└─────────────────────────────────┘
         ↓
    ┌────┴────┐
    │ Not set? │
    └────┬────┘
   Yes ↓     No ↓
┌─────────┐  ┌─────────────────────┐
│ Static  │  │ Check STORAGE config │
│ Setup   │  └─────────────────────┘
│ Page    │           ↓
└─────────┘      ┌────┴────┐
                 │ Not set? │
                 └────┬────┘
              Yes ↓        No ↓
         ┌──────────┐  ┌──────────┐
         │ Normal   │  │ Normal   │
         │ Upload   │  │ Full     │
         │ disabled │  │ function │
         └──────────┘  └──────────┘
```

## Environment Variables

| Variable | Purpose | Required | Source |
|----------|---------|----------|--------|
| `DATABASE_URL` | PostgreSQL connection string | Yes | Supabase |
| `STORAGE_PROVIDER` | Storage type, set to `s3` | Yes | Fixed value |
| `S3_ENDPOINT` | R2 endpoint URL | Yes | Cloudflare R2 |
| `S3_BUCKET` | Bucket name | Yes | Cloudflare R2 |
| `S3_ACCESS_KEY_ID` | Access key ID | Yes | Cloudflare R2 |
| `S3_SECRET_ACCESS_KEY` | Secret access key | Yes | Cloudflare R2 |
| `S3_REGION` | Region, set to `auto` for R2 | Yes | Fixed value |
| `NEXT_PUBLIC_STORAGE_BASE_URL` | Public access URL | Yes | Cloudflare R2 |
| `ADMIN_DEFAULT_PASSWORD` | Initial admin password | Yes | User-defined |

## File Structure

```
src/
├── app/
│   └── [locale]/
│       └── setup/                    # New: Setup wizard pages
│           ├── page.tsx              # Database setup guide
│           └── storage/
│               └── page.tsx          # Storage setup guide
├── components/
│   └── setup/                        # New: Setup components
│       ├── setup-wizard.tsx          # Main wizard component
│       ├── step-card.tsx             # Step card component
│       ├── copy-button.tsx           # Copy button component
│       ├── env-var-list.tsx          # Environment variable list
│       └── storage-warning-banner.tsx # Storage not configured banner
├── middleware.ts                     # Modified: Add config detection
├── lib/
│   └── config-check.ts               # New: Config check utilities
└── messages/
    ├── en.json                       # Modified: Add setup messages
    └── zh.json                       # Modified: Add setup messages
```

## UI Design

### Database Setup Page

- Full-page wizard when DATABASE_URL is not configured
- 4 steps: Create Supabase account → Create project → Add env var → Redeploy
- Language toggle (EN/中文)
- Copy buttons for environment variable names
- External links to Supabase and Vercel Dashboard
- Footer note about local deployment option (for NAS/testing only)

### Storage Warning Banner

- Appears at top of admin dashboard when storage not configured
- Dismissible but reappears on page reload
- Links to storage setup page
- Upload button shows modal with setup instructions when clicked

## Implementation Notes

1. **Middleware**: Check env vars at edge, redirect to /setup if DATABASE_URL missing
2. **Static page**: Setup page must work without database connection
3. **i18n**: Use next-intl for bilingual support
4. **Styling**: Match existing app design (Tailwind CSS, dark mode support)

## Local Deployment Note

For local/NAS deployment, users can set:
- `DATABASE_PROVIDER=local` (uses SQLite)
- `STORAGE_PROVIDER=local` (uses local filesystem)

This should be mentioned as an alternative but with clear warning that it's only suitable for private servers or testing.
