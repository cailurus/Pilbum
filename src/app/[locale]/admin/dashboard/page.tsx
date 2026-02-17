import { redirect } from "next/navigation";
import { isAuthenticated, requirePasswordChange, getSession } from "@/lib/auth";
import { DashboardClient } from "./dashboard-client";
import type { Metadata } from "next";
import { getSiteName } from "@/lib/site";
import { getTranslations } from "next-intl/server";

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
