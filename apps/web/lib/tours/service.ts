import { Role } from "@/lib/auth/rbac";
import { TOUR_STATUSES, type TourStatus } from "@/db/schema";
import type { TourDetail, TourQueryOptions, TourQueryResult } from "./query";
import { logAuditEvent } from "@/lib/audit/log";

export const ALLOWED_TOUR_CREATOR_ROLES: Role[] = ["admin", "supervisor"];

export interface InsertTourData {
  zoneId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: TourStatus;
  notes: string | null;
  createdBy: string;
}

export interface TourRecord {
  id: string;
  zoneId: string;
  zoneName: string | null;
  date: string;
  startTime: string;
  endTime: string;
  status: TourStatus;
  notes: string | null;
  startedAt: Date | null;
  completedAt: Date | null;
  cancellationReason: string | null;
  createdBy: string;
  creatorName: string | null;
  createdAt: Date;
  agentCount: number;
}

export interface TourRepository {
  findZone(id: string): Promise<{ id: string; isActive: boolean; name: string } | undefined>;
  findUserById(id: string): Promise<{ id: string; isActive: boolean; role: Role } | undefined>;
  insertTourWithAgents(data: InsertTourData, agentIds: string[]): Promise<{ id: string }>;
  listTours(): Promise<TourRecord[]>;
  findTour(id: string): Promise<{ id: string; date: string; status: TourStatus } | undefined>;
  findTourAgent(
    tourId: string,
    userId: string,
  ): Promise<{ tourId: string; userId: string } | undefined>;
  updateTour(
    id: string,
    data: {
      status?: TourStatus;
      startedAt?: Date | null;
      completedAt?: Date | null;
      cancellationReason?: string | null;
    },
  ): Promise<void>;
  listTourIdsByUser(userId: string): Promise<string[]>;
  queryTours(options: TourQueryOptions): Promise<TourQueryResult>;
  getTourById(id: string): Promise<TourDetail | undefined>;
  listCreators(): Promise<Array<{ id: string; name: string | null }>>;
}

export type CreateTourErrorCode =
  | "user_not_found"
  | "permission_denied"
  | "zone_not_found"
  | "zone_inactive"
  | "date_invalid"
  | "time_invalid"
  | "agents_required"
  | "agent_invalid";

export interface CreateTourError {
  ok: false;
  error: string;
  code: CreateTourErrorCode;
}

export interface CreateTourSuccess {
  ok: true;
  tour: { id: string };
}

export type CreateTourResult = CreateTourSuccess | CreateTourError;

export interface CreateTourInput {
  zoneId: string;
  date: string;
  startTime: string;
  endTime: string;
  agentIds: string[];
  notes?: string | null;
  createdBy: string;
}

export function isValidTourStatus(value: string): value is TourStatus {
  return (TOUR_STATUSES as readonly string[]).includes(value);
}

export function parseDateOnly(value: string): string | null {
  if (!value) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1) return null;
  if (year < 1 || year > 9999) return null;

  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }
  return `${match[1]}-${match[2]}-${match[3]}`;
}

export function isTodayOrFuture(dateStr: string): boolean {
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  return dateStr >= today;
}

export async function createTour(
  input: CreateTourInput,
  repository: TourRepository,
): Promise<CreateTourResult> {
  const createdBy = repository.findUserById(input.createdBy);
  const zone = input.zoneId ? repository.findZone(input.zoneId) : Promise.resolve(undefined);
  const [creator, zoneRecord] = await Promise.all([createdBy, zone]);

  if (!creator) {
    return { ok: false, error: "Utilisateur introuvable.", code: "user_not_found" };
  }
  if (!ALLOWED_TOUR_CREATOR_ROLES.includes(creator.role)) {
    return {
      ok: false,
      error: "Vous n'avez pas le droit de créer une tournée.",
      code: "permission_denied",
    };
  }

  if (!zoneRecord) {
    return { ok: false, error: "Zone introuvable.", code: "zone_not_found" };
  }
  if (!zoneRecord.isActive) {
    return { ok: false, error: "La zone est désactivée.", code: "zone_inactive" };
  }

  const date = parseDateOnly(input.date);
  if (!date || !isTodayOrFuture(date)) {
    return {
      ok: false,
      error: "La date doit être aujourd'hui ou dans le futur.",
      code: "date_invalid",
    };
  }

  if (!input.startTime || !input.endTime || input.startTime >= input.endTime) {
    return {
      ok: false,
      error: "L'heure de fin doit être après l'heure de début.",
      code: "time_invalid",
    };
  }

  const agentIds = Array.from(new Set(input.agentIds.filter(Boolean)));
  if (agentIds.length === 0) {
    return { ok: false, error: "Au moins un agent est requis.", code: "agents_required" };
  }

  const agents = await Promise.all(agentIds.map((id) => repository.findUserById(id)));
  for (const agent of agents) {
    if (!agent || !agent.isActive || agent.role !== "agent") {
      return {
        ok: false,
        error: "Tous les agents sélectionnés doivent être actifs et avoir le rôle agent.",
        code: "agent_invalid",
      };
    }
  }

  const result = await repository.insertTourWithAgents(
    {
      zoneId: zoneRecord.id,
      date,
      startTime: input.startTime,
      endTime: input.endTime,
      status: "planifiée",
      notes: input.notes?.trim() ? input.notes.trim() : null,
      createdBy: creator.id,
    },
    agentIds,
  );

  await logAuditEvent(creator.id, "tour.create", "tour", result.id, {
    zoneId: zoneRecord.id,
    date,
    agentIds,
  });

  return { ok: true, tour: { id: result.id } };
}
