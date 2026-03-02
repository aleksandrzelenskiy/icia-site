import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  getAdminSessionCookieName,
  verifyAdminSessionToken
} from "@/lib/admin-auth";

export default async function AdminBlogLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get(getAdminSessionCookieName())?.value;
  const session = verifyAdminSessionToken(token);

  if (!session) {
    redirect("/admin/login");
  }

  return children;
}
