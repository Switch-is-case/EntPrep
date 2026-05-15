import { cookies } from "next/headers";
export const dynamic = "force-dynamic";
export const revalidate = 0;
import { redirect } from "next/navigation";
import { verifyJWT } from "@/lib/auth-checks";
import { AdminLayoutClient } from "./AdminLayoutClient";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("ent-token")?.value;
  
  const payload = token ? await verifyJWT(token) : null;

  if (!payload || !payload.isAdmin) {
    redirect("/login?from=/admin");
  }

  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
