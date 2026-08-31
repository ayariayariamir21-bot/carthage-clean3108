import Link from "next/link";
import { requireRolesPage } from "@/lib/auth/guard";
import { dbTourRepository } from "@/lib/tours/repository";
import { dbZoneRepository } from "@/lib/zones/service";
import { TOUR_STATUSES } from "@/db/schema";
import type { TourSortColumn } from "@/lib/tours/query";
import { AppShell } from "@/components/layout/AppShell";
import { TourList } from "./tour-list";

export default async function ToursPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const currentUser = await requireRolesPage(["admin", "supervisor"]);
  const sp = await searchParams;

  const page = Number(sp.page) || 1;
  const pageSize = Number(sp.pageSize) || 20;
  const sortColumn = sp.sort as TourSortColumn | undefined;
  const sort =
    sortColumn &&
    (sortColumn === "date" ||
      sortColumn === "zone" ||
      sortColumn === "status" ||
      sortColumn === "startTime" ||
      sortColumn === "creator")
      ? { column: sortColumn, direction: sp.dir === "asc" ? ("asc" as const) : ("desc" as const) }
      : undefined;

  const filters = {
    date: sp.date?.trim() || undefined,
    dateFrom: sp.dateFrom?.trim() || undefined,
    dateTo: sp.dateTo?.trim() || undefined,
    zoneId: sp.zoneId?.trim() || undefined,
    zoneCode: sp.zoneCode?.trim() || undefined,
    status: sp.status?.trim() || undefined,
    agent: sp.agent?.trim() || undefined,
    creatorId: sp.creatorId?.trim() || undefined,
  };

  const [result, zones, creators] = await Promise.all([
    dbTourRepository.queryTours({ filters, sort, page, pageSize }),
    dbZoneRepository.listZones(),
    dbTourRepository.listCreators(),
  ]);

  const assignedIds =
    currentUser.role === "agent" ? await dbTourRepository.listTourIdsByUser(currentUser.id) : [];

  const activeZones = zones.filter((z) => z.isActive);

  return (
    <AppShell user={currentUser}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Tournées de nettoyage</h1>
          <p className="mt-1 text-slate-600">
            {result.total} tournée(s) au total — {activeZones.length} zone(s) active(s).
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/tours/new" className="btn btn-primary">
            Créer une tournée
          </Link>
          <Link href="/admin/tours/today" className="btn btn-secondary">
            Travaux du jour
          </Link>
        </div>
      </div>

      <TourList
        tours={result.rows}
        total={result.total}
        zones={zones}
        statuses={[...TOUR_STATUSES]}
        creators={creators}
        role={currentUser.role}
        assignedIds={assignedIds}
        query={sp}
        page={page}
        pageSize={pageSize}
      />
    </AppShell>
  );
}
