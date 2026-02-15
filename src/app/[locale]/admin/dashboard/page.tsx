import { redirect } from "next/navigation";
import { isAuthenticated, requirePasswordChange, getSession } from "@/lib/auth";
import { DashboardClient } from "./dashboard-client";

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
