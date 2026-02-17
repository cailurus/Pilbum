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
