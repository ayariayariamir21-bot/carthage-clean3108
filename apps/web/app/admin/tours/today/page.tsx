import Link from "next/link";
import { requireRolesPage } from "@/lib/auth/guard";
import { dbTourRepository } from "@/lib/tours/repository";
import { AppShell } from "@/components/layout/AppShell";
import { TourTable } from "../tour-table";

function todayStr(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

export default async function ToursTodayPage() {
  const currentUser = await requireRolesPage(["admin", "supervisor", "agent"]);
  const today = todayStr();

  const [result, assignedIds] = await Promise.all([
    dbTourRepository.queryTours({ filters: { date: today }, pageSize: 200 }),
    currentUser.role === "agent"
      ? dbTourRepository.listTourIdsByUser(currentUser.id)
      : Promise.resolve([] as string[]),
  ]);

  const tours =
    currentUser.role === "agent"
      ? result.rows.filter((tour) => assignedIds.includes(tour.id))
      : result.rows;

  return (
    <AppShell user={currentUser}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-800">Travaux du jour ({today})</h1>
        <div className="flex gap-2">
          <Link href="/admin/tours" className="btn btn-secondary">
            Toutes les tournées
          </Link>
          <Link href="/admin/tours/new" className="btn btn-primary">
            Créer une tournée
          </Link>
        </div>
      </div>

      {tours.length === 0 ? (
        <div className="alert alert-info">Aucune tournée programmée pour aujourd&apos;hui.</div>
      ) : (
        <TourTable tours={tours} role={currentUser.role} assignedIds={assignedIds} />
      )}

      <p className="muted mt-4">{tours.length} tournée(s) du jour.</p>
    </AppShell>
  );
}
