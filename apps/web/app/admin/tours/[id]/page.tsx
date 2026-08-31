import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireRolesPage } from "@/lib/auth/guard";
import { dbTourRepository } from "@/lib/tours/repository";
import { canViewTourDetail } from "@/lib/tours/query";
import { formatDateFr, formatDateTimeFr } from "@/lib/format";
import { AppShell } from "@/components/layout/AppShell";
import { StatusBadge, ActiveBadge } from "@/components/ui/StatusBadge";

const STATUS_LABELS: Record<string, string> = {
  planifiée: "Planifiée",
  en_cours: "En cours",
  terminée: "Terminée",
  annulée: "Annulée",
};

function fmt(value: string | null): string {
  return value ?? "—";
}

export default async function TourDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireRolesPage(["admin", "supervisor", "agent"]);
  const { id } = await params;

  const tour = await dbTourRepository.getTourById(id);
  if (!tour) {
    notFound();
  }

  if (!canViewTourDetail(user, tour)) {
    redirect("/forbidden");
  }

  return (
    <AppShell user={user}>
      <Link href="/admin/tours" className="link">
        ← Retour aux tournées
      </Link>
      <h1 className="mb-4 mt-2 text-2xl font-bold text-slate-800">Détail de la tournée</h1>

      <section className="card mb-6 max-w-2xl">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-800">Informations</h2>
            <StatusBadge status={tour.status} />
          </div>
        </div>
        <div className="card-body">
          <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-slate-500">Zone</dt>
              <dd className="text-slate-800">
                {fmt(tour.zoneName)} ({fmt(tour.zoneCode)})
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500">Date</dt>
              <dd className="text-slate-800">{formatDateFr(tour.date)}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500">Horaires</dt>
              <dd className="text-slate-800">
                {tour.startTime} – {tour.endTime}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500">Statut</dt>
              <dd className="text-slate-800">{STATUS_LABELS[tour.status] ?? tour.status}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500">Créateur</dt>
              <dd className="text-slate-800">{fmt(tour.creatorName)}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500">Début réel</dt>
              <dd className="text-slate-800">
                {tour.startedAt ? formatDateTimeFr(tour.startedAt) : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500">Fin réelle</dt>
              <dd className="text-slate-800">
                {tour.completedAt ? formatDateTimeFr(tour.completedAt) : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500">Créée le</dt>
              <dd className="text-slate-800">{formatDateTimeFr(tour.createdAt)}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-slate-500">Notes</dt>
              <dd className="whitespace-pre-wrap text-slate-800">{fmt(tour.notes)}</dd>
            </div>
            {tour.status === "annulée" ? (
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-slate-500">Raison d&apos;annulation</dt>
                <dd className="text-slate-800">{fmt(tour.cancellationReason)}</dd>
              </div>
            ) : null}
          </dl>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-slate-800">
          Agents assignés ({tour.agents.length})
        </h2>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th className="th">Nom</th>
                <th className="th">Matricule</th>
                <th className="th">Email</th>
                <th className="th">Rôle</th>
                <th className="th">Actif</th>
              </tr>
            </thead>
            <tbody>
              {tour.agents.length === 0 ? (
                <tr>
                  <td className="td" colSpan={5}>
                    Aucun agent assigné.
                  </td>
                </tr>
              ) : (
                tour.agents.map((agent) => (
                  <tr key={agent.id} className="tr-hover">
                    <td className="td">{fmt(agent.name)}</td>
                    <td className="td">{fmt(agent.matricule)}</td>
                    <td className="td">{agent.email}</td>
                    <td className="td">{agent.role}</td>
                    <td className="td">
                      <ActiveBadge active={agent.isActive} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </AppShell>
  );
}
