# Pilbum

A modern, self-hosted photo album built with Next.js. Features Live Photo support, EXIF data display, GPS mapping, and a clean gallery interface.

## Features

- **Live Photo Support** - Automatic pairing and playback of iOS Live Photos
- **EXIF Display** - Camera, lens, shooting parameters, GPS location
- **Masonry Gallery** - Responsive grid layout with lazy loading
- **Dark Mode** - System-aware theme switching
- **Multi-language** - i18n support with next-intl
- **Admin Dashboard** - Photo management, user management, batch operations

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: PostgreSQL / PGlite (local)
- **ORM**: Drizzle
- **Styling**: Tailwind CSS
- **Authentication**: Iron Session

## Quick Start

1. Clone the repository
2. Copy `.env.example` to `.env` and configure
3. Install dependencies: `npm install`
4. Initialize database: `npm run db:migrate`
5. Start development server: `npm run dev`

## Environment Variables

See `.env.example` for all available configuration options.

## License

MIT
