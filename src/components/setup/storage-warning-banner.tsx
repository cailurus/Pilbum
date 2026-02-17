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
