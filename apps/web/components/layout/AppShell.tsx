import { AppHeader } from "./AppHeader";
import type { Role } from "@/lib/auth/rbac";

export function AppShell({
  user,
  children,
}: {
  user: { email: string; role: Role };
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader user={user} />
      <main className="app-main">{children}</main>
    </div>
  );
}
