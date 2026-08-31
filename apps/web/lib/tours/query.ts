import { Role } from "@/lib/auth/rbac";
import type { TourRecord } from "./service";

export type TourSortColumn = "date" | "zone" | "status" | "startTime" | "creator";

export interface TourQueryFilters {
  date?: string;
  dateFrom?: string;
  dateTo?: string;
  zoneId?: string;
  zoneCode?: string;
  status?: string;
  agent?: string;
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

function matchesFilters(row: TourQueryRow, filters: TourQueryFilters): boolean {
  if (filters.date && row.date !== filters.date) return false;
  if (filters.dateFrom && row.date < filters.dateFrom) return false;
  if (filters.dateTo && row.date > filters.dateTo) return false;
  if (filters.zoneId && row.zoneId !== filters.zoneId) return false;
  if (filters.status && row.status !== filters.status) return false;
  if (filters.creatorId && row.createdBy !== filters.creatorId) return false;
  if (filters.zoneCode) {
    const needle = filters.zoneCode.trim().toLowerCase();
    if (!needle) return true;
    if (!row.zoneCode || !row.zoneCode.toLowerCase().includes(needle)) return false;
  }
  if (filters.agent) {
    const needle = filters.agent.trim().toLowerCase();
    if (!needle) return true;
    const hit = row.agentNames.some((n) => (n ?? "").toLowerCase().includes(needle));
    const hitMat = row.agentMatricules.some((m) => (m ?? "").toLowerCase().includes(needle));
    if (!hit && !hitMat) return false;
  }
  return true;
}

function compareRows(a: TourQueryRow, b: TourQueryRow, column: TourSortColumn): number {
  let av: string;
  let bv: string;
  switch (column) {
    case "zone":
      av = a.zoneName ?? "";
      bv = b.zoneName ?? "";
      break;
    case "status":
      av = a.status;
      bv = b.status;
      break;
    case "startTime":
      av = a.startTime;
      bv = b.startTime;
      break;
    case "creator":
      av = a.creatorName ?? "";
      bv = b.creatorName ?? "";
      break;
    case "date":
    default:
      av = a.date;
      bv = b.date;
      break;
  }
  if (av < bv) return -1;
  if (av > bv) return 1;
  return 0;
}

export function filterSortPaginateTours(
  records: TourQueryRow[],
  options: TourQueryOptions = {},
): TourQueryResult {
  const filters = options.filters ?? {};
  const column = options.sort?.column ?? "date";
  const direction = options.sort?.direction ?? "desc";

  const filtered = records.filter((row) => matchesFilters(row, filters));
  filtered.sort((a, b) => {
    const cmp = compareRows(a, b, column);
    return direction === "asc" ? cmp : -cmp;
  });

  const total = filtered.length;
  const pageSize = Math.min(200, Math.max(1, options.pageSize ?? 20));
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(Math.max(1, options.page ?? 1), totalPages);
  const offset = (page - 1) * pageSize;
  const rows = filtered.slice(offset, offset + pageSize);

  return { rows, total };
}

function csvEscape(value: string | null | undefined): string {
  const str = value ?? "";
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
