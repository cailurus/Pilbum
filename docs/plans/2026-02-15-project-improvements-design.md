# Pilbum 项目改进设计文档

**日期:** 2026-02-15
**状态:** 已批准
**部署目标:** Vercel/Cloudflare Serverless

## 概述

本文档定义了 Pilbum 本地相册项目的全面改进方案，涵盖测试、安全、性能、可维护性和国际化等方面。

## 1. 测试架构

### 技术选型
- **测试框架:** Vitest
- **组件测试:** React Testing Library
- **Mock 工具:** Vitest 内置

### 目录结构
```
tests/
├── setup.ts              # 测试环境配置
├── unit/
│   ├── lib/
│   │   ├── auth.test.ts       # 认证逻辑
│   │   ├── password.test.ts   # 密码哈希
│   │   ├── image.test.ts      # 图片处理
│   │   └── exif.test.ts       # EXIF 提取
│   └── validators/
│       └── schemas.test.ts    # Zod schema 测试
├── integration/
│   └── api/
│       ├── auth.test.ts       # 认证 API
│       ├── photos.test.ts     # 照片 API
│       └── admin.test.ts      # 管理 API
└── mocks/
    ├── db.ts                  # 数据库 mock
    └── storage.ts             # 存储 mock
```

### 覆盖目标
- 核心库函数: 80%+
- API 路由关键路径: 100%

## 2. 输入验证

### 技术选型
- **验证库:** Zod

### Schema 定义位置
- `src/lib/validators/auth.ts` - 认证相关
- `src/lib/validators/photos.ts` - 照片相关
- `src/lib/validators/users.ts` - 用户管理相关

### 验证策略
- 所有 API 路由入口验证请求体
- 返回中文错误消息
- 类型自动推断

## 3. 日志服务

### 技术选型
- **日志库:** Pino

### 位置
- `src/lib/logger.ts`

### 日志级别
- `error`: 错误和异常
- `warn`: 警告信息
- `info`: 重要业务事件
- `debug`: 调试信息

### 输出格式
JSON 格式，兼容 Vercel Logs 收集。

## 4. 速率限制

### 技术选型
- **限流库:** @upstash/ratelimit
- **存储:** Upstash Redis

### 位置
- `src/lib/rate-limit.ts`
- `src/middleware.ts` (集成)

### 限制策略
| 端点类型 | 限制 |
|----------|------|
| 通用 API | 60 次/分钟 |
| 登录接口 | 10 次/分钟 |
| 上传接口 | 20 次/分钟 |

### 环境变量
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

## 5. HTTP 缓存策略

### 静态资源 (照片)
```
Cache-Control: public, max-age=31536000, immutable
```

### API 响应 (照片列表)
```
Cache-Control: public, s-maxage=60, stale-while-revalidate=300
```

### 实现位置
- Storage Adapter 中设置资源缓存头
- API 路由中设置响应缓存头

## 6. 无障碍改进

### 改进内容
- 图片 `alt` 属性 (使用 title 或默认值)
- 图标按钮 `aria-label`
- 键盘导航支持 (Tab, Enter, Escape)
- Live Photo 添加 `role="button"` 和 `aria-pressed`
- 颜色对比度检查

### 涉及组件
- `photo-card.tsx`
- `live-photo-player.tsx`
- `upload-form.tsx`
- `user-list.tsx`
- `photo-list.tsx`

## 7. 国际化 (i18n)

### 技术选型
- **i18n 库:** next-intl

### 支持语言
- 中文 (zh) - 默认
- 英文 (en)

### 目录结构
```
src/
├── i18n/
│   ├── config.ts          # 语言配置
│   └── request.ts         # 服务端请求处理
├── messages/
│   ├── zh.json            # 中文翻译
│   └── en.json            # 英文翻译
└── middleware.ts          # 语言检测中间件
```

### URL 结构
- `/zh/...` - 中文版本
- `/en/...` - 英文版本
- `/` - 根据浏览器语言自动重定向

## 8. API 文档

### 技术选型
- **规范:** OpenAPI 3.0
- **UI:** Swagger UI (可选)

### 位置
- `docs/openapi.yaml` - API 规范文件
- `/api/docs` - Swagger UI 路由 (可选)

### 文档内容
- 所有端点定义
- 请求/响应 Schema
- 认证方式
- 错误码

## 9. 性能监控

### 方案
- **Web Vitals:** Vercel Analytics (免费)
- **自定义追踪:** 在关键操作中记录耗时日志

### 监控指标
- LCP (Largest Contentful Paint)
- FID (First Input Delay)
- CLS (Cumulative Layout Shift)
- 图片处理耗时
- API 响应时间

## 依赖变更

### 新增生产依赖
```json
{
  "zod": "^3.23.0",
  "pino": "^9.0.0",
  "@upstash/ratelimit": "^2.0.0",
  "@upstash/redis": "^1.34.0",
  "next-intl": "^4.0.0"
}
```

### 新增开发依赖
```json
{
  "vitest": "^3.0.0",
  "@testing-library/react": "^16.0.0",
  "@vitejs/plugin-react": "^4.0.0",
  "jsdom": "^26.0.0"
}
```

## 环境变量

### 新增变量
```env
# 日志
LOG_LEVEL=info

# 速率限制 (可选，不配置则禁用)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# 国际化
NEXT_PUBLIC_DEFAULT_LOCALE=zh
```
