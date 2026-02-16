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

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 15 (App Router) |
| Database | PostgreSQL / PGlite (local mode) |
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

## Environment Variables

See `.env.example` for all options:

- Database: Local PGlite or remote PostgreSQL
- Storage: Local filesystem or Azure Blob Storage
- Auth: Session secret configuration
- i18n: Default language settings

## Deployment

Deploy to any Node.js-compatible platform:

- Vercel (recommended, requires external database)
- Docker container
- Traditional VPS / Cloud server

## License

MIT
