import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { DashboardClient } from "@/components/dashboard-client";
import { AUTH_COOKIE_NAME } from "@/lib/auth";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    redirect("/");
  }

  return <DashboardClient />;
}
