import { redirect } from "next/navigation";
import { isAuthenticated, requirePasswordChange, getSession } from "@/lib/auth";
import { DashboardClient } from "./dashboard-client";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { settings, SETTING_KEYS } from "@/lib/db/schema";
import { siteConfig } from "@/config/site.config";
import { getTranslations } from "next-intl/server";

async function getSiteName(): Promise<string> {
  try {
    const allSettings = await db.select().from(settings);
    const siteNameSetting = allSettings.find(s => s.key === SETTING_KEYS.SITE_NAME);
    return siteNameSetting?.value || siteConfig.name;
  } catch {
    return siteConfig.name;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const [siteName, t] = await Promise.all([
    getSiteName(),
    getTranslations("admin"),
  ]);
  return {
    title: `${siteName} - ${t("dashboard")}`,
  };
}

export default async function DashboardPage() {
  if (!(await isAuthenticated())) {
    redirect("/admin/login");
  }

  if (await requirePasswordChange()) {
    redirect("/admin/change-password");
  }

  const session = await getSession();

  return (
    <DashboardClient
      currentUser={{
        userId: session.userId!,
        username: session.username!,
        role: session.role!,
      }}
    />
  );
}
