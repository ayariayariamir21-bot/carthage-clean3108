"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { TourTable } from "./tour-table";
import type { TourQueryRow, TourSortColumn } from "@/lib/tours/query";

const STATUS_LABELS: Record<string, string> = {
  planifiée: "Planifiée",
  en_cours: "En cours",
  terminée: "Terminée",
  annulée: "Annulée",
};

const FILTER_KEYS = [
  "date",
  "dateFrom",
  "dateTo",
  "zoneId",
  "zoneCode",
  "status",
  "agent",
  "creatorId",
  "sort",
  "dir",
  "pageSize",
] as const;

export function TourList({
  tours,
  total,
  zones,
  statuses,
  creators,
  role,
  assignedIds,
  query,
  page,
  pageSize,
}: {
  tours: TourQueryRow[];
  total: number;
  zones: Array<{ id: string; name: string; isActive: boolean }>;
  statuses: string[];
  creators: Array<{ id: string; name: string | null }>;
  role: string;
  assignedIds?: string[];
  query: Record<string, string | undefined>;
  page: number;
  pageSize: number;
}) {
  const router = useRouter();

  function buildHref(overrides: Record<string, string | undefined>, resetPage = true): string {
    const params = new URLSearchParams();
    for (const key of FILTER_KEYS) {
      const value = overrides[key] !== undefined ? overrides[key] : query[key];
      if (value) params.set(key, value);
    }
    const pageValue = resetPage ? (overrides.page ?? "1") : (overrides.page ?? query.page ?? "1");
    params.set("page", pageValue);
    return `/admin/tours?${params.toString()}`;
  }

  function applyFilters(form: HTMLFormElement) {
    const params = new URLSearchParams();
    const entries = new FormData(form);
    for (const key of FILTER_KEYS) {
      if (key === "sort" || key === "dir" || key === "pageSize") continue;
      const value = String(entries.get(key) ?? "").trim();
      if (value) params.set(key, value);
    }
    const sort = query.sort?.trim();
    const dir = query.dir?.trim();
    if (sort) params.set("sort", sort);
    if (dir) params.set("dir", dir);
    const ps = String(entries.get("pageSize") ?? "").trim();
    if (ps) params.set("pageSize", ps);
    params.set("page", "1");
    router.push(`/admin/tours?${params.toString()}`);
  }

  function handleSort(column: TourSortColumn) {
    const current = query.sort;
    const currentDir = query.dir === "asc" ? "asc" : "desc";
    const newDir = current === column && currentDir === "desc" ? "asc" : "desc";
    router.push(buildHref({ sort: column, dir: newDir }, true));
  }

  function goToPage(target: number) {
    router.push(buildHref({ page: String(target) }, false));
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const exportHref = (() => {
    const params = new URLSearchParams();
    for (const key of FILTER_KEYS) {
      if (key === "sort" || key === "dir" || key === "pageSize") continue;
      const value = query[key];
      if (value) params.set(key, value);
    }
    return `/api/admin/tours/export?${params.toString()}`;
  })();

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2,
  );

  return (
    <section>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          applyFilters(e.currentTarget);
        }}
        className="mb-4 flex flex-wrap items-end gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-card"
      >
        <div className="field mb-0">
          <label className="label" htmlFor="f-date">
            Date
          </label>
          <input
            id="f-date"
            type="date"
            name="date"
            defaultValue={query.date ?? ""}
            className="input"
          />
        </div>
        <div className="field mb-0">
          <label className="label" htmlFor="f-dateFrom">
            Du
          </label>
          <input
            id="f-dateFrom"
            type="date"
            name="dateFrom"
            defaultValue={query.dateFrom ?? ""}
            className="input"
          />
        </div>
        <div className="field mb-0">
          <label className="label" htmlFor="f-dateTo">
            Au
          </label>
          <input
            id="f-dateTo"
            type="date"
            name="dateTo"
            defaultValue={query.dateTo ?? ""}
            className="input"
          />
        </div>
        <div className="field mb-0">
          <label className="label" htmlFor="f-zone">
            Zone
          </label>
          <select id="f-zone" name="zoneId" defaultValue={query.zoneId ?? ""} className="input">
            <option value="">Toutes</option>
            {zones.map((zone) => (
              <option key={zone.id} value={zone.id}>
                {zone.name}
              </option>
            ))}
          </select>
        </div>
        <div className="field mb-0">
          <label className="label" htmlFor="f-zoneCode">
            Code zone
          </label>
          <input
            id="f-zoneCode"
            name="zoneCode"
            defaultValue={query.zoneCode ?? ""}
            placeholder="ex. ZN"
            className="input"
          />
        </div>
        <div className="field mb-0">
          <label className="label" htmlFor="f-status">
            Statut
          </label>
          <select id="f-status" name="status" defaultValue={query.status ?? ""} className="input">
            <option value="">Tous</option>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {STATUS_LABELS[status] ?? status}
              </option>
            ))}
          </select>
        </div>
        <div className="field mb-0">
          <label className="label" htmlFor="f-agent">
            Agent (nom/matricule)
          </label>
          <input
            id="f-agent"
            name="agent"
            defaultValue={query.agent ?? ""}
            placeholder="Rechercher"
            className="input"
          />
        </div>
        <div className="field mb-0">
          <label className="label" htmlFor="f-creator">
            Créateur
          </label>
          <select
            id="f-creator"
            name="creatorId"
            defaultValue={query.creatorId ?? ""}
            className="input"
          >
            <option value="">Tous</option>
            {creators.map((creator) => (
              <option key={creator.id} value={creator.id}>
                {creator.name ?? creator.id}
              </option>
            ))}
          </select>
        </div>
        <div className="field mb-0">
          <label className="label" htmlFor="f-pageSize">
            Par page
          </label>
          <select id="f-pageSize" name="pageSize" defaultValue={String(pageSize)} className="input">
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>
        </div>
        <div className="flex items-center gap-2 self-end">
          <button type="submit" className="btn btn-primary">
            Filtrer
          </button>
          <Link href="/admin/tours" className="btn btn-secondary">
            Réinitialiser
          </Link>
          <a href={exportHref} className="btn btn-ghost">
            Exporter CSV
          </a>
        </div>
      </form>

      <TourTable
        tours={tours}
        role={role}
        assignedIds={assignedIds}
        sort={{
          column: (query.sort as TourSortColumn) ?? "date",
          direction: query.dir === "asc" ? "asc" : "desc",
        }}
        onSort={handleSort}
      />

      <nav className="mt-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          disabled={page <= 1}
          onClick={() => goToPage(page - 1)}
        >
          Précédent
        </button>
        {pageNumbers.map((p, idx) => {
          const prev = pageNumbers[idx - 1];
          const ellipsis = prev && p - prev > 1;
          return (
            <span key={p}>
              {ellipsis ? <span className="muted">… </span> : null}
              <button
                type="button"
                className="btn btn-sm btn-secondary"
                disabled={p === page}
                onClick={() => goToPage(p)}
              >
                {p}
              </button>
            </span>
          );
        })}
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          disabled={page >= totalPages}
          onClick={() => goToPage(page + 1)}
        >
          Suivant
        </button>
        <span className="muted">
          Page {page} / {totalPages}
        </span>
      </nav>
    </section>
  );
}
