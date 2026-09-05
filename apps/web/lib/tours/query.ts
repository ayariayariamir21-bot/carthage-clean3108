import { Role } from "@/lib/auth/rbac";
import type { TourRecord } from "./service";

export type TourSortColumn = "date" | "zone" | "status" | "startTime" | "creator";

import type { TourStatus } from "@/db/schema";

export interface TourQueryFilters {
  date?: string;
  dateFrom?: string;
  dateTo?: string;
  zoneId?: string;
  zoneCode?: string;
  status?: TourStatus;
  agent?: string;
  agentId?: string;
  creatorId?: string;
}

export interface TourQueryOptions {
  filters?: TourQueryFilters;
  sort?: { column: TourSortColumn; direction: "asc" | "desc" };
  page?: number;
  pageSize?: number;
}

export interface TourQueryRow extends TourRecord {
  zoneCode: string | null;
  agentIds: string[];
  agentNames: string[];
  agentMatricules: string[];
}

export interface TourQueryResult {
  rows: TourQueryRow[];
  total: number;
}

export interface TourAgentSummary {
  id: string;
  name: string | null;
  matricule: string | null;
  email: string;
  role: Role;
  isActive: boolean;
}

export interface TourDetail extends TourRecord {
  zoneCode: string | null;
  agentIds: string[];
  agentNames: string[];
  agentMatricules: string[];
  agents: TourAgentSummary[];
}

export interface AuthPrincipal {
  role: Role;
  id: string;
}

export function canViewTourDetail(user: AuthPrincipal, tour: { agentIds: string[] }): boolean {
  if (user.role === "admin" || user.role === "supervisor") return true;
  if (user.role === "agent") return tour.agentIds.includes(user.id);
  return false;
}

export function csvEscape(value: string | null | undefined): string {
  const str = value ?? "";
  if (/^[=+\-@\t]/.test(str)) {
    const prefixed = "'" + str;
    if (/[",\n\r]/.test(prefixed)) {
      return `"${prefixed.replace(/"/g, '""')}"`;
    }
    return prefixed;
  }
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function toToursCsv(rows: TourQueryRow[]): string {
  const header = [
    "ID",
    "Date",
    "Zone",
    "Heure debut",
    "Heure fin",
    "Statut",
    "Nombre agents",
    "Createur",
    "Agents",
    "Notes",
    "Raison annulation",
    "Démarrage",
    "Fin",
  ];
  const lines = [header.map(csvEscape).join(",")];
  for (const row of rows) {
    lines.push(
      [
        row.id,
        row.date,
        row.zoneName ?? "",
        row.startTime,
        row.endTime,
        row.status,
        String(row.agentIds.length),
        row.creatorName ?? "",
        row.agentNames.join(", "),
        row.notes ?? "",
        row.cancellationReason ?? "",
        row.startedAt ? row.startedAt.toISOString() : "",
        row.completedAt ? row.completedAt.toISOString() : "",
      ]
        .map(csvEscape)
        .join(","),
    );
  }
  return lines.join("\r\n");
}

export function rowToCsvLine(row: TourQueryRow): string {
  return [
    row.id,
    row.date,
    row.zoneName ?? "",
    row.startTime,
    row.endTime,
    row.status,
    String(row.agentIds.length),
    row.creatorName ?? "",
    row.agentNames.join(", "),
    row.notes ?? "",
    row.cancellationReason ?? "",
    row.startedAt ? row.startedAt.toISOString() : "",
    row.completedAt ? row.completedAt.toISOString() : "",
  ]
    .map(csvEscape)
    .join(",");
}

export function generateCsvHeader(): string {
  const header = [
    "ID",
    "Date",
    "Zone",
    "Heure debut",
    "Heure fin",
    "Statut",
    "Nombre agents",
    "Createur",
    "Agents",
    "Notes",
    "Raison annulation",
    "Démarrage",
    "Fin",
  ];
  return header.map(csvEscape).join(",");
}
