import Link from "next/link";
import { requireRolePage } from "@/lib/auth/guard";
import { AppShell } from "@/components/layout/AppShell";

export default async function AdminPage() {
  const user = await requireRolePage("admin");

  return (
    <AppShell user={user}>
      <h1 className="mb-2 text-2xl font-bold text-slate-800">Administration</h1>
      <p className="mb-6 text-slate-600">
        Bienvenue <strong>{user.email}</strong>. Cette section est réservée aux utilisateurs avec le
        rôle <strong>admin</strong>.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <Link href="/dashboard" className="card card-body transition-colors hover:border-brand-400">
          Tableau de bord
        </Link>
        <Link
          href="/admin/agents"
          className="card card-body transition-colors hover:border-brand-400"
        >
          Gérer les comptes agents
        </Link>
        <Link
          href="/admin/zones"
          className="card card-body transition-colors hover:border-brand-400"
        >
          Gérer les zones de collecte
        </Link>
        <Link
          href="/admin/tours"
          className="card card-body transition-colors hover:border-brand-400"
        >
          Gérer les tournées
        </Link>
        <Link
          href="/admin/audit"
          className="card card-body transition-colors hover:border-brand-400"
        >
          Piste d&apos;audit
        </Link>
      </div>
    </AppShell>
  );
}
