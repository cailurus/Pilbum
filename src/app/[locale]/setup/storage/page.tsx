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
