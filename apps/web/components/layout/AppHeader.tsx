import Link from "next/link";
import { logoutAction } from "@/app/login/actions";
import type { Role } from "@/lib/auth/rbac";

const NAV_ITEMS: Array<{ href: string; label: string; roles: Role[] }> = [
  { href: "/dashboard", label: "Tableau de bord", roles: ["admin", "supervisor", "agent"] },
  { href: "/admin/tours", label: "Tournées", roles: ["admin", "supervisor", "agent"] },
  { href: "/admin/zones", label: "Zones", roles: ["admin", "supervisor"] },
  { href: "/admin/agents", label: "Agents", roles: ["admin"] },
  { href: "/admin/audit", label: "Audit", roles: ["admin"] },
];

export function AppHeader({ user }: { user: { email: string; role: Role } }) {
  const items = NAV_ITEMS.filter((item) => item.roles.includes(user.role));

  return (
    <header className="border-b border-slate-200 bg-brand-600 text-white">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="text-lg font-bold tracking-tight text-white">
            🧹 Carthage-Clean
          </Link>
          <nav className="flex flex-wrap items-center gap-1">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-md px-3 py-1.5 text-sm font-medium text-brand-100 transition-colors hover:bg-brand-500 hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <span
            className="hidden text-sm text-brand-100 sm:inline"
            aria-label="Utilisateur connecté"
          >
            {user.email}
          </span>
          <form action={logoutAction}>
            <button
              type="submit"
              className="rounded-md bg-white/10 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-white/20"
            >
              Déconnexion
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
