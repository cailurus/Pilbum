# Pilbum 项目改进实施计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 为 Pilbum 相册项目添加测试、输入验证、日志、速率限制、缓存、无障碍、国际化和 API 文档。

**Architecture:** 分阶段实施，每个阶段独立可用。先建立测试基础设施，再逐步添加其他功能。使用 Vitest 测试、Zod 验证、Pino 日志、Upstash 限流、next-intl 国际化。

**Tech Stack:** Vitest, Zod, Pino, @upstash/ratelimit, next-intl, OpenAPI 3.0

---

## Phase 1: 测试基础设施

### Task 1: 安装测试依赖

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`
- Create: `tests/setup.ts`

**Step 1: 安装依赖**

Run:
```bash
npm install -D vitest @testing-library/react @vitejs/plugin-react jsdom @types/node
```

**Step 2: 创建 Vitest 配置**

Create `vitest.config.ts`:
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      include: ['src/lib/**/*.ts'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

**Step 3: 创建测试 setup 文件**

Create `tests/setup.ts`:
```typescript
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Cleanup after each test
afterEach(() => {
  cleanup();
});
```

**Step 4: 添加测试脚本到 package.json**

Add to `package.json` scripts:
```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage"
  }
}
```

**Step 5: 验证配置**

Run: `npm test -- --run`
Expected: No tests found (正常，我们还没写测试)

**Step 6: Commit**

```bash
git add package.json package-lock.json vitest.config.ts tests/setup.ts
git commit -m "chore: setup vitest testing infrastructure"
```

---

### Task 2: 编写密码模块测试

**Files:**
- Create: `tests/unit/lib/password.test.ts`

**Step 1: 编写测试**

Create `tests/unit/lib/password.test.ts`:
```typescript
import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword } from '@/lib/password';

describe('password', () => {
  describe('hashPassword', () => {
    it('should return a hash containing salt and key', async () => {
      const hash = await hashPassword('testpassword');
      expect(hash).toContain(':');
      const [salt, key] = hash.split(':');
      expect(salt).toHaveLength(32); // 16 bytes = 32 hex chars
      expect(key).toHaveLength(128); // 64 bytes = 128 hex chars
    });

    it('should generate different hashes for same password', async () => {
      const hash1 = await hashPassword('samepassword');
      const hash2 = await hashPassword('samepassword');
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('verifyPassword', () => {
    it('should return true for correct password', async () => {
      const password = 'correctpassword';
      const hash = await hashPassword(password);
      const result = await verifyPassword(password, hash);
      expect(result).toBe(true);
    });

    it('should return false for incorrect password', async () => {
      const hash = await hashPassword('correctpassword');
      const result = await verifyPassword('wrongpassword', hash);
      expect(result).toBe(false);
    });

    it('should handle empty password', async () => {
      const hash = await hashPassword('');
      const result = await verifyPassword('', hash);
      expect(result).toBe(true);
    });
  });
});
```

**Step 2: 运行测试验证通过**

Run: `npm test -- --run tests/unit/lib/password.test.ts`
Expected: All 5 tests pass

**Step 3: Commit**

```bash
git add tests/unit/lib/password.test.ts
git commit -m "test: add password module tests"
```

---

### Task 3: 创建数据库 Mock

**Files:**
- Create: `tests/mocks/db.ts`

**Step 1: 创建 mock**

Create `tests/mocks/db.ts`:
```typescript
import { vi } from 'vitest';

export const mockUser = {
  id: 'test-user-id',
  username: 'testuser',
  passwordHash: '', // Will be set in tests
  role: 'user' as const,
  displayName: 'Test User',
  mustChangePassword: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const mockAdmin = {
  ...mockUser,
  id: 'test-admin-id',
  username: 'admin',
  role: 'admin' as const,
};

export const mockPhoto = {
  id: 'test-photo-id',
  title: 'Test Photo',
  description: 'A test photo',
  imageUrl: '/uploads/photos/test/full.jpg',
  thumbnailUrl: '/uploads/photos/test/thumb.jpg',
  blurDataUrl: null,
  width: 1920,
  height: 1080,
  isLivePhoto: false,
  livePhotoVideoUrl: null,
  cameraMake: 'Apple',
  cameraModel: 'iPhone 15 Pro',
  lensModel: null,
  focalLength: 24,
  aperture: 1.8,
  shutterSpeed: '1/1000',
  iso: 100,
  takenAt: new Date(),
  latitude: null,
  longitude: null,
  altitude: null,
  originalFilename: 'IMG_001.jpg',
  fileSize: 1024000,
  mimeType: 'image/jpeg',
  sortOrder: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
};

export function createMockDb() {
  return {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    offset: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    returning: vi.fn(),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
  };
}
```

**Step 2: Commit**

```bash
git add tests/mocks/db.ts
git commit -m "test: add database mocks"
```

---

## Phase 2: 输入验证 (Zod)

### Task 4: 安装 Zod 并创建验证 Schema

**Files:**
- Create: `src/lib/validators/index.ts`
- Create: `src/lib/validators/auth.ts`
- Create: `src/lib/validators/photos.ts`
- Create: `src/lib/validators/users.ts`

**Step 1: 安装 Zod**

Run:
```bash
npm install zod
```

**Step 2: 创建认证 Schema**

Create `src/lib/validators/auth.ts`:
```typescript
import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().min(1, '用户名不能为空'),
  password: z.string().min(1, '密码不能为空'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, '当前密码不能为空'),
  newPassword: z.string().min(8, '新密码至少需要 8 个字符'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
```

**Step 3: 创建照片 Schema**

Create `src/lib/validators/photos.ts`:
```typescript
import { z } from 'zod';

export const photoUpdateSchema = z.object({
  title: z.string().max(200, '标题不能超过 200 个字符').optional(),
  description: z.string().max(2000, '描述不能超过 2000 个字符').optional(),
  sortOrder: z.number().int('排序必须是整数').optional(),
});

export const photoQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type PhotoUpdateInput = z.infer<typeof photoUpdateSchema>;
export type PhotoQueryInput = z.infer<typeof photoQuerySchema>;
```

**Step 4: 创建用户 Schema**

Create `src/lib/validators/users.ts`:
```typescript
import { z } from 'zod';

export const createUserSchema = z.object({
  username: z
    .string()
    .min(2, '用户名至少需要 2 个字符')
    .max(50, '用户名不能超过 50 个字符')
    .regex(/^[a-zA-Z0-9_]+$/, '用户名只能包含字母、数字和下划线'),
  password: z.string().min(6, '密码至少需要 6 个字符'),
  role: z.enum(['admin', 'user']).default('user'),
  displayName: z.string().max(100, '显示名称不能超过 100 个字符').optional(),
});

export const updateUserSchema = z.object({
  role: z.enum(['admin', 'user']).optional(),
  displayName: z.string().max(100).optional(),
  password: z.string().min(6, '密码至少需要 6 个字符').optional(),
  mustChangePassword: z.boolean().optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
```

**Step 5: 创建索引导出**

Create `src/lib/validators/index.ts`:
```typescript
export * from './auth';
export * from './photos';
export * from './users';
```

**Step 6: Commit**

```bash
git add src/lib/validators/
git commit -m "feat: add Zod validation schemas"
```

---

### Task 5: 编写验证 Schema 测试

**Files:**
- Create: `tests/unit/validators/schemas.test.ts`

**Step 1: 编写测试**

Create `tests/unit/validators/schemas.test.ts`:
```typescript
import { describe, it, expect } from 'vitest';
import {
  loginSchema,
  changePasswordSchema,
  photoUpdateSchema,
  createUserSchema,
} from '@/lib/validators';

describe('validators', () => {
  describe('loginSchema', () => {
    it('should accept valid credentials', () => {
      const result = loginSchema.safeParse({
        username: 'testuser',
        password: 'password123',
      });
      expect(result.success).toBe(true);
    });

    it('should reject empty username', () => {
      const result = loginSchema.safeParse({
        username: '',
        password: 'password123',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('用户名不能为空');
      }
    });

    it('should reject empty password', () => {
      const result = loginSchema.safeParse({
        username: 'testuser',
        password: '',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('changePasswordSchema', () => {
    it('should accept valid password change', () => {
      const result = changePasswordSchema.safeParse({
        currentPassword: 'oldpassword',
        newPassword: 'newpassword123',
      });
      expect(result.success).toBe(true);
    });

    it('should reject short new password', () => {
      const result = changePasswordSchema.safeParse({
        currentPassword: 'oldpassword',
        newPassword: '123',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('新密码至少需要 8 个字符');
      }
    });
  });

  describe('photoUpdateSchema', () => {
    it('should accept valid update', () => {
      const result = photoUpdateSchema.safeParse({
        title: 'New Title',
        description: 'New description',
        sortOrder: 5,
      });
      expect(result.success).toBe(true);
    });

    it('should accept partial update', () => {
      const result = photoUpdateSchema.safeParse({ title: 'Only Title' });
      expect(result.success).toBe(true);
    });

    it('should reject too long title', () => {
      const result = photoUpdateSchema.safeParse({
        title: 'a'.repeat(201),
      });
      expect(result.success).toBe(false);
    });
  });

  describe('createUserSchema', () => {
    it('should accept valid user', () => {
      const result = createUserSchema.safeParse({
        username: 'newuser',
        password: 'password123',
        role: 'user',
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid username characters', () => {
      const result = createUserSchema.safeParse({
        username: 'user@name',
        password: 'password123',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          '用户名只能包含字母、数字和下划线'
        );
      }
    });

    it('should reject invalid role', () => {
      const result = createUserSchema.safeParse({
        username: 'newuser',
        password: 'password123',
        role: 'superadmin',
      });
      expect(result.success).toBe(false);
    });
  });
});
```

**Step 2: 运行测试**

Run: `npm test -- --run tests/unit/validators/schemas.test.ts`
Expected: All tests pass

**Step 3: Commit**

```bash
git add tests/unit/validators/schemas.test.ts
git commit -m "test: add validation schema tests"
```

---

### Task 6: 集成验证到登录 API

**Files:**
- Modify: `src/app/api/auth/login/route.ts`

**Step 1: 更新登录 API**

Replace `src/app/api/auth/login/route.ts`:
```typescript
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { verifyPassword } from "@/lib/password";
import { loginSchema } from "@/lib/validators";

export async function POST(request: NextRequest) {
  const body = await request.json();

  // Validate input
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const { username, password } = parsed.data;

  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (!user) {
      return NextResponse.json(
        { error: "用户名或密码错误" },
        { status: 401 }
      );
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { error: "用户名或密码错误" },
        { status: 401 }
      );
    }

    const session = await getSession();
    session.isLoggedIn = true;
    session.userId = user.id;
    session.username = user.username;
    session.role = user.role as "admin" | "user";
    session.mustChangePassword = user.mustChangePassword;
    await session.save();

    return NextResponse.json({
      success: true,
      mustChangePassword: user.mustChangePassword,
      role: user.role,
    });
  } catch {
    // Database not ready (users table doesn't exist)
    return NextResponse.json(
      { error: "数据库尚未初始化" },
      { status: 503 }
    );
  }
}
```

**Step 2: Commit**

```bash
git add src/app/api/auth/login/route.ts
git commit -m "feat: integrate Zod validation into login API"
```

---

### Task 7: 集成验证到其他 API

**Files:**
- Modify: `src/app/api/photos/route.ts`
- Modify: `src/app/api/photos/[id]/route.ts`
- Modify: `src/app/api/admin/users/route.ts`
- Modify: `src/app/api/auth/change-password/route.ts`

**Step 1: 更新照片列表 API**

Add validation to `src/app/api/photos/route.ts`:
```typescript
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { photos } from "@/lib/db/schema";
import { desc, sql } from "drizzle-orm";
import { photoQuerySchema } from "@/lib/validators";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  // Validate query params
  const parsed = photoQuerySchema.safeParse({
    page: searchParams.get("page") || "1",
    limit: searchParams.get("limit") || "20",
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const { page, limit } = parsed.data;
  const offset = (page - 1) * limit;

  try {
    const [result, countResult] = await Promise.all([
      db
        .select()
        .from(photos)
        .orderBy(desc(photos.sortOrder), desc(photos.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)` })
        .from(photos),
    ]);

    const total = Number(countResult[0].count);

    return NextResponse.json({
      photos: result,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch {
    // Database not initialized yet
    return NextResponse.json({
      photos: [],
      pagination: { page, limit, total: 0, totalPages: 0 },
    });
  }
}
```

**Step 2: 更新照片详情 API (需要先读取现有文件)**

Read and modify `src/app/api/photos/[id]/route.ts` to add validation for PATCH.

**Step 3: 更新用户管理 API**

Modify `src/app/api/admin/users/route.ts` POST to use `createUserSchema`.

**Step 4: 更新修改密码 API**

Modify `src/app/api/auth/change-password/route.ts` to use `changePasswordSchema`.

**Step 5: Commit**

```bash
git add src/app/api/
git commit -m "feat: integrate Zod validation into all APIs"
```

---

## Phase 3: 日志服务 (Pino)

### Task 8: 安装 Pino 并创建 Logger

**Files:**
- Create: `src/lib/logger.ts`

**Step 1: 安装 Pino**

Run:
```bash
npm install pino
```

**Step 2: 创建 Logger 模块**

Create `src/lib/logger.ts`:
```typescript
import pino from 'pino';

const isDevelopment = process.env.NODE_ENV !== 'production';

export const logger = pino({
  level: process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info'),
  formatters: {
    level: (label) => ({ level: label }),
  },
  ...(isDevelopment && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
      },
    },
  }),
});

// Create child loggers for different modules
export const authLogger = logger.child({ module: 'auth' });
export const storageLogger = logger.child({ module: 'storage' });
export const uploadLogger = logger.child({ module: 'upload' });
export const dbLogger = logger.child({ module: 'db' });
```

**Step 3: 安装开发依赖 (美化输出)**

Run:
```bash
npm install -D pino-pretty
```

**Step 4: Commit**

```bash
git add src/lib/logger.ts package.json package-lock.json
git commit -m "feat: add Pino logger"
```

---

### Task 9: 集成日志到关键模块

**Files:**
- Modify: `src/app/api/auth/login/route.ts`
- Modify: `src/app/api/upload/route.ts`
- Modify: `src/lib/db/index.ts`

**Step 1: 添加登录日志**

Add to login route:
```typescript
import { authLogger } from "@/lib/logger";

// On successful login:
authLogger.info({ userId: user.id, username }, 'User logged in');

// On failed login:
authLogger.warn({ username }, 'Failed login attempt');
```

**Step 2: 添加上传日志**

Add to upload route:
```typescript
import { uploadLogger } from "@/lib/logger";

// On upload start:
uploadLogger.info({ filename: imageFile.name, size: imageBuffer.length }, 'Starting upload');

// On upload complete:
uploadLogger.info({ photoId, duration: Date.now() - start }, 'Upload complete');

// On error:
uploadLogger.error({ error, filename: imageFile.name }, 'Upload failed');
```

**Step 3: Commit**

```bash
git add src/app/api/ src/lib/db/
git commit -m "feat: integrate logging into auth and upload"
```

---

## Phase 4: 速率限制 (Upstash)

### Task 10: 安装 Upstash 并创建限流器

**Files:**
- Create: `src/lib/rate-limit.ts`

**Step 1: 安装依赖**

Run:
```bash
npm install @upstash/ratelimit @upstash/redis
```

**Step 2: 创建限流模块**

Create `src/lib/rate-limit.ts`:
```typescript
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { NextRequest, NextResponse } from 'next/server';

// Only enable if Upstash is configured
const redis = process.env.UPSTASH_REDIS_REST_URL
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

// Different rate limiters for different endpoints
export const generalLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(60, '1 m'),
      prefix: 'ratelimit:general',
    })
  : null;

export const authLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, '1 m'),
      prefix: 'ratelimit:auth',
    })
  : null;

export const uploadLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(20, '1 m'),
      prefix: 'ratelimit:upload',
    })
  : null;

export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';
  return ip;
}

export async function checkRateLimit(
  limiter: Ratelimit | null,
  identifier: string
): Promise<{ success: boolean; remaining: number; reset: number } | null> {
  if (!limiter) return null;

  const result = await limiter.limit(identifier);
  return {
    success: result.success,
    remaining: result.remaining,
    reset: result.reset,
  };
}

export function rateLimitResponse(reset: number): NextResponse {
  return NextResponse.json(
    { error: '请求过于频繁，请稍后再试' },
    {
      status: 429,
      headers: {
        'Retry-After': String(Math.ceil((reset - Date.now()) / 1000)),
      },
    }
  );
}
```

**Step 3: Commit**

```bash
git add src/lib/rate-limit.ts package.json package-lock.json
git commit -m "feat: add rate limiting with Upstash"
```

---

### Task 11: 集成限流到 API

**Files:**
- Modify: `src/app/api/auth/login/route.ts`
- Modify: `src/app/api/upload/route.ts`

**Step 1: 添加登录限流**

Add to the beginning of login POST handler:
```typescript
import { authLimiter, getClientIp, checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  // Rate limiting
  const ip = getClientIp(request);
  const rateLimit = await checkRateLimit(authLimiter, ip);
  if (rateLimit && !rateLimit.success) {
    return rateLimitResponse(rateLimit.reset);
  }

  // ... rest of handler
}
```

**Step 2: 添加上传限流**

Similar integration for upload route.

**Step 3: Commit**

```bash
git add src/app/api/
git commit -m "feat: integrate rate limiting into auth and upload APIs"
```

---

## Phase 5: HTTP 缓存

### Task 12: 添加 API 缓存头

**Files:**
- Modify: `src/app/api/photos/route.ts`
- Modify: `src/app/api/photos/[id]/route.ts`

**Step 1: 更新照片列表 API 响应**

Add cache headers to response:
```typescript
return NextResponse.json(
  { photos: result, pagination: { ... } },
  {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
    },
  }
);
```

**Step 2: 更新照片详情 API 响应**

```typescript
return NextResponse.json(
  { photo },
  {
    headers: {
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  }
);
```

**Step 3: Commit**

```bash
git add src/app/api/photos/
git commit -m "feat: add HTTP cache headers to photo APIs"
```

---

## Phase 6: 无障碍改进

### Task 13: 改进 PhotoCard 无障碍

**Files:**
- Modify: `src/components/gallery/photo-card.tsx`

**Step 1: 添加 aria 属性**

Update component:
```typescript
// Add to Link component
<Link
  href={`/photo/${photo.id}`}
  className="block group"
  aria-label={photo.title || `查看照片 ${photo.id.slice(0, 8)}`}
>

// Update img alt
alt={photo.title || `照片 - ${photo.cameraModel || '未知相机'}`}
```

**Step 2: Commit**

```bash
git add src/components/gallery/photo-card.tsx
git commit -m "a11y: improve photo card accessibility"
```

---

### Task 14: 改进 LivePhotoPlayer 无障碍

**Files:**
- Modify: `src/components/livephoto/live-photo-player.tsx`

**Step 1: 添加交互属性**

Update the wrapper div:
```typescript
<div
  className={`relative overflow-hidden ${className}`}
  style={{ aspectRatio: `${width}/${height}` }}
  role="button"
  tabIndex={0}
  aria-label={`实况照片: ${alt}，${mode === 'hover' ? '悬停播放' : '长按播放'}`}
  aria-pressed={isPlaying}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      isPlaying ? stopPlayback() : startPlayback();
    }
  }}
  onMouseEnter={handleMouseEnter}
  // ... rest of handlers
>
```

**Step 2: Commit**

```bash
git add src/components/livephoto/live-photo-player.tsx
git commit -m "a11y: improve live photo player accessibility"
```

---

## Phase 7: 国际化 (next-intl)

### Task 15: 安装 next-intl 并配置

**Files:**
- Create: `src/i18n/config.ts`
- Create: `src/i18n/request.ts`
- Create: `src/messages/zh.json`
- Create: `src/messages/en.json`
- Create: `src/middleware.ts`

**Step 1: 安装依赖**

Run:
```bash
npm install next-intl
```

**Step 2: 创建配置文件**

Create `src/i18n/config.ts`:
```typescript
export const locales = ['zh', 'en'] as const;
export const defaultLocale = 'zh' as const;

export type Locale = (typeof locales)[number];
```

Create `src/i18n/request.ts`:
```typescript
import { getRequestConfig } from 'next-intl/server';
import { locales, defaultLocale } from './config';

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !locales.includes(locale as any)) {
    locale = defaultLocale;
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
```

**Step 3: 创建翻译文件**

Create `src/messages/zh.json`:
```json
{
  "common": {
    "loading": "加载中...",
    "error": "发生错误",
    "save": "保存",
    "cancel": "取消",
    "delete": "删除",
    "edit": "编辑",
    "confirm": "确认",
    "back": "返回"
  },
  "auth": {
    "login": "登录",
    "logout": "退出登录",
    "username": "用户名",
    "password": "密码",
    "changePassword": "修改密码",
    "currentPassword": "当前密码",
    "newPassword": "新密码",
    "loginError": "用户名或密码错误",
    "loginSuccess": "登录成功"
  },
  "gallery": {
    "title": "相册",
    "noPhotos": "暂无照片",
    "loadMore": "加载更多",
    "viewPhoto": "查看照片"
  },
  "photo": {
    "title": "标题",
    "description": "描述",
    "camera": "相机",
    "lens": "镜头",
    "focalLength": "焦距",
    "aperture": "光圈",
    "shutterSpeed": "快门速度",
    "iso": "ISO",
    "takenAt": "拍摄时间",
    "location": "位置"
  },
  "admin": {
    "dashboard": "管理面板",
    "photos": "照片管理",
    "users": "用户管理",
    "upload": "上传照片",
    "createUser": "创建用户",
    "role": "角色",
    "admin": "管理员",
    "user": "普通用户"
  },
  "upload": {
    "selectFiles": "选择文件",
    "dropHere": "拖放文件到这里",
    "uploading": "上传中...",
    "success": "上传成功",
    "failed": "上传失败"
  },
  "errors": {
    "unauthorized": "未授权访问",
    "forbidden": "禁止访问",
    "notFound": "未找到",
    "serverError": "服务器错误",
    "tooManyRequests": "请求过于频繁"
  }
}
```

Create `src/messages/en.json`:
```json
{
  "common": {
    "loading": "Loading...",
    "error": "An error occurred",
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "edit": "Edit",
    "confirm": "Confirm",
    "back": "Back"
  },
  "auth": {
    "login": "Login",
    "logout": "Logout",
    "username": "Username",
    "password": "Password",
    "changePassword": "Change Password",
    "currentPassword": "Current Password",
    "newPassword": "New Password",
    "loginError": "Invalid username or password",
    "loginSuccess": "Login successful"
  },
  "gallery": {
    "title": "Gallery",
    "noPhotos": "No photos yet",
    "loadMore": "Load more",
    "viewPhoto": "View photo"
  },
  "photo": {
    "title": "Title",
    "description": "Description",
    "camera": "Camera",
    "lens": "Lens",
    "focalLength": "Focal Length",
    "aperture": "Aperture",
    "shutterSpeed": "Shutter Speed",
    "iso": "ISO",
    "takenAt": "Taken at",
    "location": "Location"
  },
  "admin": {
    "dashboard": "Dashboard",
    "photos": "Photo Management",
    "users": "User Management",
    "upload": "Upload Photo",
    "createUser": "Create User",
    "role": "Role",
    "admin": "Admin",
    "user": "User"
  },
  "upload": {
    "selectFiles": "Select Files",
    "dropHere": "Drop files here",
    "uploading": "Uploading...",
    "success": "Upload successful",
    "failed": "Upload failed"
  },
  "errors": {
    "unauthorized": "Unauthorized",
    "forbidden": "Forbidden",
    "notFound": "Not Found",
    "serverError": "Server Error",
    "tooManyRequests": "Too many requests"
  }
}
```

**Step 4: 创建中间件**

Create `src/middleware.ts`:
```typescript
import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n/config';

export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'as-needed',
});

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
```

**Step 5: Commit**

```bash
git add src/i18n/ src/messages/ src/middleware.ts package.json package-lock.json
git commit -m "feat: add next-intl internationalization setup"
```

---

### Task 16: 重组路由结构支持 i18n

**Files:**
- Move: `src/app/page.tsx` → `src/app/[locale]/page.tsx`
- Move: `src/app/layout.tsx` → `src/app/[locale]/layout.tsx`
- Move: `src/app/admin/` → `src/app/[locale]/admin/`
- Move: `src/app/photo/` → `src/app/[locale]/photo/`
- Create: `src/app/[locale]/layout.tsx`

**Note:** This requires careful file reorganization. The API routes stay in place.

**Step 1: 创建 locale 路由布局**

Create `src/app/[locale]/layout.tsx`:
```typescript
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pilbum",
  description: "A personal photography portfolio",
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```

**Step 2: 移动页面文件并更新导入**

Move files and update imports as needed.

**Step 3: Commit**

```bash
git add src/app/
git commit -m "feat: reorganize routes for i18n support"
```

---

## Phase 8: API 文档

### Task 17: 创建 OpenAPI 规范

**Files:**
- Create: `docs/openapi.yaml`

**Step 1: 编写 API 规范**

Create `docs/openapi.yaml`:
```yaml
openapi: 3.0.3
info:
  title: Pilbum API
  description: Personal photography portfolio API
  version: 1.0.0

servers:
  - url: /api

paths:
  /auth/login:
    post:
      summary: User login
      tags: [Authentication]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [username, password]
              properties:
                username:
                  type: string
                password:
                  type: string
      responses:
        '200':
          description: Login successful
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                  mustChangePassword:
                    type: boolean
                  role:
                    type: string
                    enum: [admin, user]
        '401':
          description: Invalid credentials
        '429':
          description: Too many requests

  /auth/logout:
    post:
      summary: User logout
      tags: [Authentication]
      responses:
        '200':
          description: Logout successful

  /auth/me:
    get:
      summary: Get current user
      tags: [Authentication]
      responses:
        '200':
          description: Current user info
        '401':
          description: Not authenticated

  /photos:
    get:
      summary: List photos
      tags: [Photos]
      parameters:
        - name: page
          in: query
          schema:
            type: integer
            default: 1
        - name: limit
          in: query
          schema:
            type: integer
            default: 20
            maximum: 100
      responses:
        '200':
          description: Photo list
          content:
            application/json:
              schema:
                type: object
                properties:
                  photos:
                    type: array
                    items:
                      $ref: '#/components/schemas/Photo'
                  pagination:
                    $ref: '#/components/schemas/Pagination'

  /photos/{id}:
    get:
      summary: Get photo details
      tags: [Photos]
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
            format: uuid
      responses:
        '200':
          description: Photo details
        '404':
          description: Photo not found

    patch:
      summary: Update photo
      tags: [Photos]
      security:
        - session: []
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
            format: uuid
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                title:
                  type: string
                  maxLength: 200
                description:
                  type: string
                  maxLength: 2000
                sortOrder:
                  type: integer
      responses:
        '200':
          description: Photo updated
        '401':
          description: Unauthorized
        '404':
          description: Photo not found

    delete:
      summary: Delete photo
      tags: [Photos]
      security:
        - session: []
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
            format: uuid
      responses:
        '200':
          description: Photo deleted
        '401':
          description: Unauthorized
        '404':
          description: Photo not found

  /upload:
    post:
      summary: Upload photo
      tags: [Photos]
      security:
        - session: []
      requestBody:
        required: true
        content:
          multipart/form-data:
            schema:
              type: object
              required: [image]
              properties:
                image:
                  type: string
                  format: binary
                video:
                  type: string
                  format: binary
                  description: Live Photo video
                title:
                  type: string
                description:
                  type: string
      responses:
        '201':
          description: Photo uploaded
        '401':
          description: Unauthorized
        '429':
          description: Too many requests

  /admin/users:
    get:
      summary: List users
      tags: [Admin]
      security:
        - session: []
      responses:
        '200':
          description: User list
        '403':
          description: Admin only

    post:
      summary: Create user
      tags: [Admin]
      security:
        - session: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [username, password]
              properties:
                username:
                  type: string
                  minLength: 2
                  maxLength: 50
                password:
                  type: string
                  minLength: 6
                role:
                  type: string
                  enum: [admin, user]
                displayName:
                  type: string
      responses:
        '201':
          description: User created
        '403':
          description: Admin only
        '409':
          description: Username exists

components:
  schemas:
    Photo:
      type: object
      properties:
        id:
          type: string
          format: uuid
        title:
          type: string
        description:
          type: string
        imageUrl:
          type: string
        thumbnailUrl:
          type: string
        width:
          type: integer
        height:
          type: integer
        isLivePhoto:
          type: boolean
        livePhotoVideoUrl:
          type: string
        cameraModel:
          type: string
        aperture:
          type: number
        shutterSpeed:
          type: string
        iso:
          type: integer
        takenAt:
          type: string
          format: date-time
        createdAt:
          type: string
          format: date-time

    Pagination:
      type: object
      properties:
        page:
          type: integer
        limit:
          type: integer
        total:
          type: integer
        totalPages:
          type: integer

  securitySchemes:
    session:
      type: apiKey
      in: cookie
      name: pilbum_session
```

**Step 2: Commit**

```bash
git add docs/openapi.yaml
git commit -m "docs: add OpenAPI specification"
```

---

## Final: 更新环境变量模板

### Task 18: 创建环境变量模板

**Files:**
- Create: `.env.example`

**Step 1: 创建模板**

Create `.env.example`:
```bash
# Database
DATABASE_PROVIDER=local  # local | postgresql
LOCAL_DB_PATH=./data/pglite
# DATABASE_URL=postgresql://user:pass@host:5432/pilbum

# Storage
STORAGE_PROVIDER=local  # local | azure
LOCAL_STORAGE_PATH=public/uploads
# AZURE_STORAGE_CONNECTION_STRING=
# AZURE_STORAGE_CONTAINER_NAME=photos
# NEXT_PUBLIC_STORAGE_BASE_URL=

# Authentication
# SESSION_SECRET=  # Auto-generated if not set
ADMIN_DEFAULT_PASSWORD=admin

# Logging
LOG_LEVEL=info  # debug | info | warn | error

# Rate Limiting (optional)
# UPSTASH_REDIS_REST_URL=
# UPSTASH_REDIS_REST_TOKEN=

# Internationalization
NEXT_PUBLIC_DEFAULT_LOCALE=zh
```

**Step 2: Commit**

```bash
git add .env.example
git commit -m "docs: add environment variables template"
```

---

## Summary

完成以上所有任务后，项目将具备：

1. **测试** - Vitest 测试框架，核心模块测试覆盖
2. **验证** - Zod 输入验证，中文错误消息
3. **日志** - Pino 结构化日志，Serverless 友好
4. **限流** - Upstash 速率限制，防止 API 滥用
5. **缓存** - HTTP 缓存头，优化性能
6. **无障碍** - ARIA 属性，键盘导航支持
7. **国际化** - next-intl，中英文支持
8. **文档** - OpenAPI 3.0 规范

总计 18 个任务，预计需要按顺序执行。
