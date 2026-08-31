"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  cancelTourAction,
  completeTourAction,
  startTourAction,
  type TourFormState,
} from "./actions";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatDateFr } from "@/lib/format";
import type { TourSortColumn } from "@/lib/tours/query";

const INITIAL: TourFormState = {};

function RowActions({
  tourId,
  status,
  canManage,
  canCancel,
}: {
  tourId: string;
  status: string;
  canManage: boolean;
  canCancel: boolean;
}) {
  const [s, startAction] = useActionState(startTourAction.bind(null, tourId), INITIAL);
  const [c, completeAction] = useActionState(completeTourAction.bind(null, tourId), INITIAL);
  const [x, cancelAction] = useActionState(cancelTourAction.bind(null, tourId), INITIAL);

  if (!canManage && !canCancel) {
    return <span className="muted">—</span>;
  }

  const error = s.error ?? c.error ?? x.error;

  return (
    <div className="flex flex-col gap-1">
      {status === "planifiée" && canManage ? (
        <form action={startAction}>
          <button type="submit" className="btn btn-primary btn-sm">
            Démarrer
          </button>
        </form>
      ) : null}

      {status === "en_cours" && canManage ? (
        <form action={completeAction}>
          <button type="submit" className="btn btn-primary btn-sm">
            Terminer
          </button>
        </form>
      ) : null}

      {(status === "planifiée" || status === "en_cours") && canCancel ? (
        <form action={cancelAction} className="flex gap-1">
          <input
            name="reason"
            placeholder="Raison"
            className="input btn-sm"
            style={{ minWidth: 120 }}
          />
          <button type="submit" className="btn btn-danger btn-sm">
            Annuler
          </button>
        </form>
      ) : null}

      {error ? (
        <span role="alert" className="text-xs text-red-600">
          {error}
        </span>
      ) : null}
    </div>
  );
}

export function TourTable({
  tours,
  role,
  assignedIds,
  sort,
  onSort,
}: {
  tours: Array<{
    id: string;
    zoneName: string | null;
    date: string;
    startTime: string;
    endTime: string;
    status: string;
    agentCount: number;
    creatorName: string | null;
  }>;
  role: string;
  assignedIds?: string[];
  sort?: { column: TourSortColumn; direction: "asc" | "desc" };
  onSort?: (column: TourSortColumn) => void;
}) {
  const assignedSet = new Set(assignedIds ?? []);
  const isStaff = role === "admin" || role === "supervisor";

  function header(column: TourSortColumn, label: string) {
    const active = sort?.column === column;
    const arrow = active ? (sort?.direction === "asc" ? " ▲" : " ▼") : "";
    if (!onSort) {
      return <th className="th">{label}</th>;
    }
    return (
      <th className="th">
        <button
          type="button"
          onClick={() => onSort(column)}
          className="font-semibold hover:text-brand-600"
        >
          {label}
          {arrow}
        </button>
      </th>
    );
  }

  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            {header("date", "Date")}
            {header("zone", "Zone")}
            <th className="th">Horaires</th>
            <th className="th">Agents</th>
            {header("status", "Statut")}
            {header("creator", "Créée par")}
            <th className="th">Détails</th>
            <th className="th">Actions</th>
          </tr>
        </thead>
        <tbody>
          {tours.length === 0 ? (
            <tr>
              <td className="td" colSpan={8}>
                Aucune tournée.
              </td>
            </tr>
          ) : (
            tours.map((tour) => {
              const assigned = isStaff || assignedSet.has(tour.id);
              return (
                <tr key={tour.id} className="tr-hover">
                  <td className="td">{formatDateFr(tour.date)}</td>
                  <td className="td">{tour.zoneName ?? "—"}</td>
                  <td className="td">
                    {tour.startTime} – {tour.endTime}
                  </td>
                  <td className="td">{tour.agentCount}</td>
                  <td className="td">
                    <StatusBadge status={tour.status} />
                  </td>
                  <td className="td">{tour.creatorName ?? "—"}</td>
                  <td className="td">
                    <Link href={`/admin/tours/${tour.id}`} className="link">
                      Détails
                    </Link>
                  </td>
                  <td className="td">
                    <RowActions
                      tourId={tour.id}
                      status={tour.status}
                      canManage={assigned}
                      canCancel={isStaff}
                    />
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
