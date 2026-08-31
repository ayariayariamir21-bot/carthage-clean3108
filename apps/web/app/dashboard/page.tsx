import Link from "next/link";
import { requireRolesPage } from "@/lib/auth/guard";
import { getDashboardData } from "@/lib/dashboard/service";
import { AppShell } from "@/components/layout/AppShell";
import { TourTable } from "@/app/admin/tours/tour-table";

export default async function DashboardPage() {
  const user = await requireRolesPage(["admin", "supervisor", "agent"]);
  const data = await getDashboardData(user);

  return (
    <AppShell user={user}>
      <h1 className="mb-6 text-2xl font-bold text-slate-800">Tableau de bord</h1>

      {data.role === "agent" ? (
        <section>
          <h2 className="mb-3 text-lg font-semibold text-slate-800">
            Mes tournées du jour ou à venir
          </h2>
          <p className="mb-4 text-slate-600">{data.upcomingCount} tournée(s) programmée(s).</p>
          {data.myTours.length === 0 ? (
            <div className="alert alert-info">Aucune tournée programmée pour le moment.</div>
          ) : (
            <TourTable
              tours={data.myTours}
              role="agent"
              assignedIds={data.myTours.map((t) => t.id)}
            />
          )}
        </section>
      ) : (
        <section>
          <h2 className="mb-3 text-lg font-semibold text-slate-800">Indicateurs du jour</h2>
          <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            <div className="stat">
              <span className="stat-label">Zones actives</span>
              <span className="stat-value">{data.activeZones}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Agents actifs</span>
              <span className="stat-value">{data.activeAgents}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Planifiées</span>
              <span className="stat-value">{data.countsByStatus.planifiée}</span>
            </div>
            <div className="stat">
              <span className="stat-label">En cours</span>
              <span className="stat-value">{data.countsByStatus.en_cours}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Terminées</span>
              <span className="stat-value">{data.countsByStatus.terminée}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Annulées</span>
              <span className="stat-value">{data.countsByStatus.annulée}</span>
            </div>
          </div>

          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-800">Tournées du jour</h2>
            <Link href="/admin/tours" className="btn btn-secondary btn-sm">
              Voir toutes les tournées
            </Link>
          </div>
          {data.todayTours.length === 0 ? (
            <div className="alert alert-info">Aucune tournée programmée aujourd&apos;hui.</div>
          ) : (
            <TourTable tours={data.todayTours} role={user.role} />
          )}
        </section>
      )}
    </AppShell>
  );
}
