# Setup Wizard Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Create a setup wizard that guides Vercel users through configuring Supabase (database) and Cloudflare R2 (storage) after one-click deploy.

**Architecture:** Middleware detects missing DATABASE_URL and redirects to static setup page. When database is configured but storage is not, a warning banner appears in admin dashboard and upload is disabled with a modal prompt.

**Tech Stack:** Next.js 15, next-intl (i18n), Tailwind CSS

---

## Task 1: Create Config Check Utilities

**Files:**
- Create: `src/lib/config-check.ts`

**Step 1: Create the config check utility file**

```typescript
// src/lib/config-check.ts

/**
 * Check if database is configured for cloud deployment
 * Returns true if DATABASE_URL is set (cloud) or DATABASE_PROVIDER is "local"
 */
export function isDatabaseConfigured(): boolean {
  const provider = process.env.DATABASE_PROVIDER;
  if (provider === "local") return true;
  return !!process.env.DATABASE_URL;
}

/**
 * Check if object storage is configured for cloud deployment
 * Returns true if cloud storage is configured or STORAGE_PROVIDER is "local"
 */
export function isStorageConfigured(): boolean {
  const provider = process.env.STORAGE_PROVIDER;

  // Local storage is valid (for NAS/testing)
  if (provider === "local" || !provider) {
    // If no provider set but DATABASE_URL exists, storage is NOT configured
    // This means user deployed to Vercel but hasn't set up storage yet
    if (process.env.DATABASE_URL && !provider) {
      return false;
    }
    return true;
  }

  if (provider === "s3") {
    return !!(
      process.env.S3_ENDPOINT &&
      process.env.S3_BUCKET &&
      process.env.S3_ACCESS_KEY_ID &&
      process.env.S3_SECRET_ACCESS_KEY
    );
  }

  if (provider === "azure") {
    return !!(
      process.env.AZURE_STORAGE_CONNECTION_STRING &&
      process.env.AZURE_STORAGE_CONTAINER_NAME
    );
  }

  if (provider === "supabase") {
    return !!(
      process.env.SUPABASE_URL &&
      process.env.SUPABASE_ANON_KEY &&
      process.env.SUPABASE_BUCKET
    );
  }

  return false;
}

/**
 * Get configuration status for display
 */
export function getConfigStatus() {
  return {
    database: isDatabaseConfigured(),
    storage: isStorageConfigured(),
    isLocalMode: process.env.DATABASE_PROVIDER === "local",
  };
}
```

**Step 2: Verify file was created correctly**

Run: `cat src/lib/config-check.ts | head -20`
Expected: Shows first 20 lines of the file

**Step 3: Commit**

```bash
git add src/lib/config-check.ts
git commit -m "feat(setup): add config check utilities"
```

---

## Task 2: Add i18n Messages for Setup Wizard

**Files:**
- Modify: `src/messages/en.json`
- Modify: `src/messages/zh.json`

**Step 1: Add English messages**

Add the following `"setup"` key to `src/messages/en.json` after the `"errors"` section:

```json
  "setup": {
    "welcome": "Welcome to Pilbum",
    "configRequired": "Configuration Required",
    "databaseSetup": "Database Setup",
    "storageSetup": "Storage Setup",
    "databaseDescription": "Before you can start using Pilbum, you need to configure a PostgreSQL database.",
    "storageDescription": "To upload and store photos, you need to configure object storage.",
    "step": "Step {number}",
    "step1Title": "Create a Supabase Account",
    "step1Desc": "Visit Supabase and sign up for a free account. The free tier includes 500MB of database storage.",
    "step2Title": "Create a New Project",
    "step2Desc": "Click \"New Project\", set your project name and database password. Wait for the project to initialize (about 2 minutes).",
    "step3Title": "Get Connection String",
    "step3Desc": "Go to Settings → Database, find \"Connection string\" section, select \"URI\" and copy the connection string.",
    "step4Title": "Add Environment Variable",
    "step4Desc": "Go to your Vercel project settings, add the following environment variable:",
    "step5Title": "Redeploy",
    "step5Desc": "After adding the environment variable, click \"Redeploy\" in Vercel to apply the changes.",
    "storageStep1Title": "Create a Cloudflare Account",
    "storageStep1Desc": "Visit Cloudflare and sign up for a free account. R2 offers 10GB free storage with no egress fees.",
    "storageStep2Title": "Create R2 Bucket",
    "storageStep2Desc": "Navigate to R2 Object Storage, click \"Create bucket\" and name it (e.g., pilbum-photos).",
    "storageStep3Title": "Create API Token",
    "storageStep3Desc": "Go to R2 → Manage R2 API Tokens → Create API Token. Set permissions to \"Object Read & Write\" and select your bucket.",
    "storageStep4Title": "Enable Public Access",
    "storageStep4Desc": "In bucket settings, enable \"R2.dev subdomain\" for public access. Copy the public URL.",
    "storageStep5Title": "Add Environment Variables",
    "storageStep5Desc": "Add the following environment variables in Vercel:",
    "storageStep6Title": "Redeploy",
    "storageStep6Desc": "After adding all variables, click \"Redeploy\" in Vercel to apply the changes.",
    "goToSupabase": "Go to Supabase",
    "goToCloudflare": "Go to Cloudflare",
    "goToVercel": "Go to Vercel Dashboard",
    "copied": "Copied!",
    "copy": "Copy",
    "localDeployment": "Local Deployment",
    "localDeploymentDesc": "For NAS or testing only: Set DATABASE_PROVIDER=local to use SQLite and local file storage. Not suitable for Vercel or serverless platforms.",
    "envVarName": "Variable Name",
    "envVarValue": "Value",
    "envVarSource": "Where to Get",
    "fromSupabase": "From Supabase",
    "fromCloudflare": "From Cloudflare R2",
    "requirement": "Required",
    "requirement": "Required",
    "requirement": "Required",
    "requirement": "Required",
    "requirement": "Required",
    "requirement": "Required",
    "requirement": "Required",
    "requirement": "Required",
    "requirement": "Required",
    "requirement": "Required",
    "requirement": "Required",
    "requirement": "Required",
    "requirement": "Required",
    "requirement": "Required",
    "requirement": "Required",
    "requirement": "Required",
    "requirement": "Required",
    "storageNotConfigured": "Storage Not Configured",
    "storageNotConfiguredDesc": "Photo upload is disabled. Please configure object storage to enable uploads.",
    "configureStorage": "Configure Storage",
    "dismiss": "Dismiss"
  }
```

**Step 2: Add Chinese messages**

Add the following `"setup"` key to `src/messages/zh.json` after the `"errors"` section:

```json
  "setup": {
    "welcome": "欢迎使用 Pilbum",
    "configRequired": "需要配置",
    "databaseSetup": "数据库配置",
    "storageSetup": "存储配置",
    "databaseDescription": "在开始使用 Pilbum 之前，你需要配置一个 PostgreSQL 数据库。",
    "storageDescription": "要上传和存储照片，你需要配置对象存储服务。",
    "step": "第 {number} 步",
    "step1Title": "创建 Supabase 账号",
    "step1Desc": "访问 Supabase 并注册免费账号。免费套餐包含 500MB 数据库存储空间。",
    "step2Title": "创建新项目",
    "step2Desc": "点击「New Project」，设置项目名称和数据库密码。等待项目初始化（约 2 分钟）。",
    "step3Title": "获取连接字符串",
    "step3Desc": "进入 Settings → Database，找到「Connection string」部分，选择「URI」并复制连接字符串。",
    "step4Title": "添加环境变量",
    "step4Desc": "进入 Vercel 项目设置，添加以下环境变量：",
    "step5Title": "重新部署",
    "step5Desc": "添加环境变量后，在 Vercel 中点击「Redeploy」使配置生效。",
    "storageStep1Title": "创建 Cloudflare 账号",
    "storageStep1Desc": "访问 Cloudflare 并注册免费账号。R2 提供 10GB 免费存储，无出口流量费用。",
    "storageStep2Title": "创建 R2 存储桶",
    "storageStep2Desc": "进入 R2 对象存储，点击「创建存储桶」并命名（如 pilbum-photos）。",
    "storageStep3Title": "创建 API 令牌",
    "storageStep3Desc": "进入 R2 → 管理 R2 API 令牌 → 创建 API 令牌。设置权限为「对象读写」并选择你的存储桶。",
    "storageStep4Title": "启用公开访问",
    "storageStep4Desc": "在存储桶设置中，启用「R2.dev 子域名」以获得公开访问。复制公开 URL。",
    "storageStep5Title": "添加环境变量",
    "storageStep5Desc": "在 Vercel 中添加以下环境变量：",
    "storageStep6Title": "重新部署",
    "storageStep6Desc": "添加所有变量后，在 Vercel 中点击「Redeploy」使配置生效。",
    "goToSupabase": "前往 Supabase",
    "goToCloudflare": "前往 Cloudflare",
    "goToVercel": "前往 Vercel 控制台",
    "copied": "已复制！",
    "copy": "复制",
    "localDeployment": "本地部署",
    "localDeploymentDesc": "仅适用于 NAS 或测试：设置 DATABASE_PROVIDER=local 以使用 SQLite 和本地文件存储。不适用于 Vercel 或无服务器平台。",
    "envVarName": "变量名",
    "envVarValue": "值",
    "envVarSource": "获取位置",
    "fromSupabase": "从 Supabase 获取",
    "fromCloudflare": "从 Cloudflare R2 获取",
    "requirement": "必填",
    "storageNotConfigured": "存储未配置",
    "storageNotConfiguredDesc": "照片上传功能已禁用。请配置对象存储以启用上传。",
    "configureStorage": "配置存储",
    "dismiss": "关闭"
  }
```

**Step 3: Verify JSON is valid**

Run: `node -e "require('./src/messages/en.json'); require('./src/messages/zh.json'); console.log('JSON valid')"`
Expected: `JSON valid`

**Step 4: Commit**

```bash
git add src/messages/en.json src/messages/zh.json
git commit -m "feat(setup): add i18n messages for setup wizard"
```

---

## Task 3: Create Copy Button Component

**Files:**
- Create: `src/components/setup/copy-button.tsx`

**Step 1: Create the component**

```typescript
// src/components/setup/copy-button.tsx
"use client";

import { useState } from "react";

interface CopyButtonProps {
  text: string;
  label?: string;
  copiedLabel?: string;
}

export function CopyButton({ text, label = "Copy", copiedLabel = "Copied!" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`px-3 py-1.5 text-sm rounded-lg transition-all duration-200 ${
        copied
          ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
          : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
      }`}
    >
      {copied ? (
        <span className="flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          {copiedLabel}
        </span>
      ) : (
        <span className="flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          {label}
        </span>
      )}
    </button>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/setup/copy-button.tsx
git commit -m "feat(setup): add copy button component"
```

---

## Task 4: Create Step Card Component

**Files:**
- Create: `src/components/setup/step-card.tsx`

**Step 1: Create the component**

```typescript
// src/components/setup/step-card.tsx
interface StepCardProps {
  number: number;
  title: string;
  description: string;
  children?: React.ReactNode;
}

export function StepCard({ number, title, description, children }: StepCardProps) {
  return (
    <div className="relative pl-12 pb-8 last:pb-0">
      {/* Vertical line */}
      <div className="absolute left-4 top-8 bottom-0 w-px bg-neutral-200 dark:bg-neutral-800 last:hidden" />

      {/* Step number circle */}
      <div className="absolute left-0 top-0 w-8 h-8 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-black flex items-center justify-center text-sm font-medium">
        {number}
      </div>

      {/* Content */}
      <div className="space-y-3">
        <h3 className="text-lg font-medium text-neutral-900 dark:text-white">
          {title}
        </h3>
        <p className="text-neutral-600 dark:text-neutral-400">
          {description}
        </p>
        {children && (
          <div className="mt-4">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/setup/step-card.tsx
git commit -m "feat(setup): add step card component"
```

---

## Task 5: Create Environment Variable List Component

**Files:**
- Create: `src/components/setup/env-var-list.tsx`

**Step 1: Create the component**

```typescript
// src/components/setup/env-var-list.tsx
"use client";

import { CopyButton } from "./copy-button";

interface EnvVar {
  name: string;
  value: string;
  source: string;
}

interface EnvVarListProps {
  variables: EnvVar[];
  copyLabel?: string;
  copiedLabel?: string;
}

export function EnvVarList({ variables, copyLabel = "Copy", copiedLabel = "Copied!" }: EnvVarListProps) {
  return (
    <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-neutral-50 dark:bg-neutral-900/50">
            <th className="px-4 py-3 text-left font-medium text-neutral-500 dark:text-neutral-400">
              Variable
            </th>
            <th className="px-4 py-3 text-left font-medium text-neutral-500 dark:text-neutral-400">
              Value / Source
            </th>
            <th className="px-4 py-3 w-20"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
          {variables.map((v) => (
            <tr key={v.name} className="bg-white dark:bg-neutral-950">
              <td className="px-4 py-3">
                <code className="text-sm font-mono text-neutral-900 dark:text-neutral-100">
                  {v.name}
                </code>
              </td>
              <td className="px-4 py-3">
                {v.value ? (
                  <code className="text-sm font-mono text-blue-600 dark:text-blue-400">
                    {v.value}
                  </code>
                ) : (
                  <span className="text-neutral-500 dark:text-neutral-400">
                    {v.source}
                  </span>
                )}
              </td>
              <td className="px-4 py-3">
                <CopyButton
                  text={v.name}
                  label={copyLabel}
                  copiedLabel={copiedLabel}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/setup/env-var-list.tsx
git commit -m "feat(setup): add environment variable list component"
```

---

## Task 6: Create Database Setup Page

**Files:**
- Create: `src/app/[locale]/setup/page.tsx`

**Step 1: Create the setup page**

```typescript
// src/app/[locale]/setup/page.tsx
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { StepCard } from "@/components/setup/step-card";
import { EnvVarList } from "@/components/setup/env-var-list";
import { LanguageToggle } from "@/components/language-toggle";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "setup" });
  return {
    title: t("databaseSetup"),
  };
}

export default function SetupPage() {
  const t = useTranslations("setup");
  const common = useTranslations("common");

  const databaseEnvVars = [
    { name: "DATABASE_URL", value: "", source: t("fromSupabase") },
    { name: "ADMIN_DEFAULT_PASSWORD", value: "", source: t("requirement") },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-b border-neutral-200 dark:border-neutral-800">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-neutral-900 dark:text-white">
            {t("welcome")}
          </h1>
          <LanguageToggle />
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="space-y-8">
          {/* Intro */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-900/30">
              <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
              {t("databaseSetup")}
            </h2>
            <p className="text-neutral-600 dark:text-neutral-400 max-w-xl mx-auto">
              {t("databaseDescription")}
            </p>
          </div>

          {/* Steps */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-8">
            <StepCard
              number={1}
              title={t("step1Title")}
              description={t("step1Desc")}
            >
              <a
                href="https://supabase.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
              >
                {t("goToSupabase")}
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </StepCard>

            <StepCard
              number={2}
              title={t("step2Title")}
              description={t("step2Desc")}
            />

            <StepCard
              number={3}
              title={t("step3Title")}
              description={t("step3Desc")}
            />

            <StepCard
              number={4}
              title={t("step4Title")}
              description={t("step4Desc")}
            >
              <EnvVarList
                variables={databaseEnvVars}
                copyLabel={t("copy")}
                copiedLabel={t("copied")}
              />
              <div className="mt-4">
                <a
                  href="https://vercel.com/dashboard"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-900 dark:bg-white text-white dark:text-black rounded-lg hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors"
                >
                  {t("goToVercel")}
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </StepCard>

            <StepCard
              number={5}
              title={t("step5Title")}
              description={t("step5Desc")}
            />
          </div>

          {/* Local deployment note */}
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-xl p-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium text-amber-800 dark:text-amber-200">
                  {t("localDeployment")}
                </h4>
                <p className="mt-1 text-sm text-amber-700 dark:text-amber-300/80">
                  {t("localDeploymentDesc")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/app/[locale]/setup/page.tsx
git commit -m "feat(setup): add database setup page"
```

---

## Task 7: Create Storage Setup Page

**Files:**
- Create: `src/app/[locale]/setup/storage/page.tsx`

**Step 1: Create the storage setup page**

```typescript
// src/app/[locale]/setup/storage/page.tsx
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { StepCard } from "@/components/setup/step-card";
import { EnvVarList } from "@/components/setup/env-var-list";
import { LanguageToggle } from "@/components/language-toggle";
import Link from "next/link";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "setup" });
  return {
    title: t("storageSetup"),
  };
}

export default function StorageSetupPage() {
  const t = useTranslations("setup");

  const storageEnvVars = [
    { name: "STORAGE_PROVIDER", value: "s3", source: "" },
    { name: "S3_ENDPOINT", value: "", source: t("fromCloudflare") },
    { name: "S3_BUCKET", value: "", source: t("fromCloudflare") },
    { name: "S3_ACCESS_KEY_ID", value: "", source: t("fromCloudflare") },
    { name: "S3_SECRET_ACCESS_KEY", value: "", source: t("fromCloudflare") },
    { name: "S3_REGION", value: "auto", source: "" },
    { name: "NEXT_PUBLIC_STORAGE_BASE_URL", value: "", source: t("fromCloudflare") },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-b border-neutral-200 dark:border-neutral-800">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/dashboard"
              className="text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <h1 className="text-xl font-semibold text-neutral-900 dark:text-white">
              {t("storageSetup")}
            </h1>
          </div>
          <LanguageToggle />
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="space-y-8">
          {/* Intro */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-orange-100 dark:bg-orange-900/30">
              <svg className="w-8 h-8 text-orange-600 dark:text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
              {t("storageSetup")}
            </h2>
            <p className="text-neutral-600 dark:text-neutral-400 max-w-xl mx-auto">
              {t("storageDescription")}
            </p>
          </div>

          {/* Steps */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-8">
            <StepCard
              number={1}
              title={t("storageStep1Title")}
              description={t("storageStep1Desc")}
            >
              <a
                href="https://dash.cloudflare.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
              >
                {t("goToCloudflare")}
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </StepCard>

            <StepCard
              number={2}
              title={t("storageStep2Title")}
              description={t("storageStep2Desc")}
            />

            <StepCard
              number={3}
              title={t("storageStep3Title")}
              description={t("storageStep3Desc")}
            />

            <StepCard
              number={4}
              title={t("storageStep4Title")}
              description={t("storageStep4Desc")}
            />

            <StepCard
              number={5}
              title={t("storageStep5Title")}
              description={t("storageStep5Desc")}
            >
              <EnvVarList
                variables={storageEnvVars}
                copyLabel={t("copy")}
                copiedLabel={t("copied")}
              />
              <div className="mt-4">
                <a
                  href="https://vercel.com/dashboard"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-900 dark:bg-white text-white dark:text-black rounded-lg hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors"
                >
                  {t("goToVercel")}
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </StepCard>

            <StepCard
              number={6}
              title={t("storageStep6Title")}
              description={t("storageStep6Desc")}
            />
          </div>

          {/* Local deployment note */}
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-xl p-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium text-amber-800 dark:text-amber-200">
                  {t("localDeployment")}
                </h4>
                <p className="mt-1 text-sm text-amber-700 dark:text-amber-300/80">
                  {t("localDeploymentDesc")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/app/[locale]/setup/storage/page.tsx
git commit -m "feat(setup): add storage setup page"
```

---

## Task 8: Create Storage Warning Banner Component

**Files:**
- Create: `src/components/setup/storage-warning-banner.tsx`

**Step 1: Create the component**

```typescript
// src/components/setup/storage-warning-banner.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";

export function StorageWarningBanner() {
  const [dismissed, setDismissed] = useState(false);
  const t = useTranslations("setup");

  if (dismissed) return null;

  return (
    <div className="bg-amber-50 dark:bg-amber-950/50 border-b border-amber-200 dark:border-amber-800/50">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                {t("storageNotConfigured")}
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-300/80">
                {t("storageNotConfiguredDesc")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/setup/storage"
              className="px-3 py-1.5 text-sm font-medium bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors"
            >
              {t("configureStorage")}
            </Link>
            <button
              onClick={() => setDismissed(true)}
              className="p-1.5 text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-200 transition-colors"
              title={t("dismiss")}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/setup/storage-warning-banner.tsx
git commit -m "feat(setup): add storage warning banner component"
```

---

## Task 9: Create Setup Components Index

**Files:**
- Create: `src/components/setup/index.ts`

**Step 1: Create the index file**

```typescript
// src/components/setup/index.ts
export { CopyButton } from "./copy-button";
export { StepCard } from "./step-card";
export { EnvVarList } from "./env-var-list";
export { StorageWarningBanner } from "./storage-warning-banner";
```

**Step 2: Commit**

```bash
git add src/components/setup/index.ts
git commit -m "feat(setup): add setup components index"
```

---

## Task 10: Update Middleware for Config Detection

**Files:**
- Modify: `src/middleware.ts`

**Step 1: Update middleware to check for database configuration**

Replace the contents of `src/middleware.ts` with:

```typescript
// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { locales, defaultLocale } from "../i18n";

const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale,
  localePrefix: "as-needed",
});

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip for API routes, static files, and Next.js internals
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/_vercel") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Check if this is a setup page
  const isSetupPage = pathname.includes("/setup");

  // Check database configuration
  const databaseProvider = process.env.DATABASE_PROVIDER;
  const databaseUrl = process.env.DATABASE_URL;
  const isDatabaseConfigured = databaseProvider === "local" || !!databaseUrl;

  // If database is not configured, redirect to setup (unless already on setup page)
  if (!isDatabaseConfigured && !isSetupPage) {
    const locale = pathname.split("/")[1];
    const validLocale = locales.includes(locale as typeof locales[number]) ? locale : defaultLocale;
    const setupUrl = new URL(`/${validLocale}/setup`, request.url);
    return NextResponse.redirect(setupUrl);
  }

  // If database is configured but user is on setup page (not storage), redirect to admin
  if (isDatabaseConfigured && pathname.endsWith("/setup")) {
    const locale = pathname.split("/")[1];
    const validLocale = locales.includes(locale as typeof locales[number]) ? locale : defaultLocale;
    const adminUrl = new URL(`/${validLocale}/admin/dashboard`, request.url);
    return NextResponse.redirect(adminUrl);
  }

  // Apply intl middleware for all other requests
  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
```

**Step 2: Verify middleware compiles**

Run: `npx tsc --noEmit src/middleware.ts 2>&1 | head -10 || echo "TypeScript check complete"`

**Step 3: Commit**

```bash
git add src/middleware.ts
git commit -m "feat(setup): add database config detection to middleware"
```

---

## Task 11: Add Storage Config Check API

**Files:**
- Create: `src/app/api/config/storage/route.ts`

**Step 1: Create the API route**

```typescript
// src/app/api/config/storage/route.ts
import { NextResponse } from "next/server";
import { isStorageConfigured } from "@/lib/config-check";

export async function GET() {
  return NextResponse.json({
    configured: isStorageConfigured(),
  });
}
```

**Step 2: Commit**

```bash
git add src/app/api/config/storage/route.ts
git commit -m "feat(setup): add storage config check API"
```

---

## Task 12: Update Dashboard to Show Storage Warning

**Files:**
- Modify: `src/app/[locale]/admin/dashboard/dashboard-client.tsx`

**Step 1: Add storage warning banner to dashboard**

At the top of the file, add the import:

```typescript
import { StorageWarningBanner } from "@/components/setup/storage-warning-banner";
```

**Step 2: Add state for storage configuration**

Add to the component state declarations:

```typescript
const [storageConfigured, setStorageConfigured] = useState(true);
```

**Step 3: Add useEffect to check storage config**

Add after other useEffects:

```typescript
useEffect(() => {
  fetch("/api/config/storage")
    .then((res) => res.json())
    .then((data) => setStorageConfigured(data.configured))
    .catch(() => setStorageConfigured(true)); // Assume configured on error
}, []);
```

**Step 4: Add StorageWarningBanner to JSX**

Add right after the opening return statement, before the main container:

```tsx
{!storageConfigured && <StorageWarningBanner />}
```

**Step 5: Commit**

```bash
git add src/app/[locale]/admin/dashboard/dashboard-client.tsx
git commit -m "feat(setup): show storage warning banner in dashboard"
```

---

## Task 13: Disable Upload When Storage Not Configured

**Files:**
- Modify: `src/components/admin/upload-form.tsx`

**Step 1: Add storage check state and effect**

After the existing state declarations, add:

```typescript
const [storageConfigured, setStorageConfigured] = useState(true);
const [showStorageModal, setShowStorageModal] = useState(false);

useEffect(() => {
  fetch("/api/config/storage")
    .then((res) => res.json())
    .then((data) => setStorageConfigured(data.configured))
    .catch(() => setStorageConfigured(true));
}, []);
```

**Step 2: Wrap the upload button handler**

Modify the `handleUpload` function to check storage first:

```typescript
async function handleUpload() {
  if (!storageConfigured) {
    setShowStorageModal(true);
    return;
  }
  // ... rest of existing handleUpload code
}
```

**Step 3: Add storage modal at the end of the component JSX (before final closing div)**

```tsx
{/* Storage not configured modal */}
{showStorageModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
    <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 max-w-md mx-4 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
          <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
          存储未配置
        </h3>
      </div>
      <p className="text-neutral-600 dark:text-neutral-400">
        照片上传功能需要配置对象存储服务。请先完成存储配置。
      </p>
      <div className="flex gap-3 justify-end">
        <button
          onClick={() => setShowStorageModal(false)}
          className="px-4 py-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
        >
          取消
        </button>
        <a
          href="/setup/storage"
          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors"
        >
          配置存储
        </a>
      </div>
    </div>
  </div>
)}
```

**Step 4: Commit**

```bash
git add src/components/admin/upload-form.tsx
git commit -m "feat(setup): disable upload when storage not configured"
```

---

## Task 14: Build and Test

**Step 1: Run build to check for errors**

Run: `npm run build`
Expected: Build completes successfully

**Step 2: Test locally**

Run: `npm run dev`

Test scenarios:
1. Remove DATABASE_URL from .env → should redirect to /setup
2. Set DATABASE_URL but not storage vars → should show warning banner
3. Set all vars → should work normally

**Step 3: Final commit**

```bash
git add -A
git commit -m "feat(setup): complete setup wizard implementation

- Add config detection utilities
- Create database setup page with Supabase guide
- Create storage setup page with Cloudflare R2 guide
- Add warning banner for unconfigured storage
- Disable uploads when storage not configured
- Support bilingual (en/zh) setup flow
- Update middleware for config-based routing"
```

---

## Summary

| Task | Description | Files |
|------|-------------|-------|
| 1 | Config check utilities | `src/lib/config-check.ts` |
| 2 | i18n messages | `src/messages/en.json`, `src/messages/zh.json` |
| 3 | Copy button component | `src/components/setup/copy-button.tsx` |
| 4 | Step card component | `src/components/setup/step-card.tsx` |
| 5 | Env var list component | `src/components/setup/env-var-list.tsx` |
| 6 | Database setup page | `src/app/[locale]/setup/page.tsx` |
| 7 | Storage setup page | `src/app/[locale]/setup/storage/page.tsx` |
| 8 | Storage warning banner | `src/components/setup/storage-warning-banner.tsx` |
| 9 | Components index | `src/components/setup/index.ts` |
| 10 | Middleware update | `src/middleware.ts` |
| 11 | Storage config API | `src/app/api/config/storage/route.ts` |
| 12 | Dashboard warning | `src/app/[locale]/admin/dashboard/dashboard-client.tsx` |
| 13 | Upload form check | `src/components/admin/upload-form.tsx` |
| 14 | Build and test | - |
