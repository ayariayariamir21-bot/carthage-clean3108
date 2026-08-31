"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { ZoneRecord } from "@/lib/zones/service";
import { ZoneEditForm } from "./zone-edit-form";
import { deleteZoneAction, toggleZoneActiveAction } from "./actions";
import { ActiveBadge } from "@/components/ui/StatusBadge";

type Filter = "all" | "active" | "inactive";

export function ZoneList({ zones }: { zones: ZoneRecord[] }) {
  const [filter, setFilter] = useState<Filter>("all");

  const visible = useMemo(() => {
    if (filter === "active") return zones.filter((z) => z.isActive);
    if (filter === "inactive") return zones.filter((z) => !z.isActive);
    return zones;
  }, [filter, zones]);

  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <label htmlFor="zone-filter" className="text-sm font-medium text-slate-700">
          Filtre :
        </label>
        <select
          id="zone-filter"
          className="input max-w-xs"
          value={filter}
          onChange={(e) => setFilter(e.target.value as Filter)}
        >
          <option value="all">Toutes</option>
          <option value="active">Actives</option>
          <option value="inactive">Inactives</option>
        </select>
      </div>

      {visible.length === 0 ? (
        <div className="alert alert-info">Aucune zone à afficher.</div>
      ) : (
        <ul className="grid gap-4">
          {visible.map((zone) => (
            <li key={zone.id} className="card card-body">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="font-semibold text-slate-800">
                    {zone.name} <span className="muted">— code {zone.code}</span>
                  </div>
                  {zone.description ? (
                    <div className="mt-0.5 text-sm text-slate-500">{zone.description}</div>
                  ) : null}
                  <div className="mt-2">
                    <ActiveBadge active={zone.isActive} />
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <form action={toggleZoneActiveAction}>
                    <input type="hidden" name="id" value={zone.id} />
                    <input type="hidden" name="active" value={String(zone.isActive)} />
                    <button type="submit" className="btn btn-secondary btn-sm">
                      {zone.isActive ? "Désactiver" : "Activer"}
                    </button>
                  </form>
                  <form action={deleteZoneAction}>
                    <input type="hidden" name="id" value={zone.id} />
                    <button type="submit" className="btn btn-danger btn-sm">
                      Supprimer
                    </button>
                  </form>
                  <Link
                    href={`/admin/zones/${zone.id}/assignments`}
                    className="btn btn-ghost btn-sm"
                  >
                    Gérer les responsables
                  </Link>
                </div>
              </div>
              <div className="mt-4 border-t border-slate-100 pt-4">
                <ZoneEditForm zone={zone} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
