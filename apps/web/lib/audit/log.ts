import { and, desc, eq, gte, ilike, lte, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { auditLogs, users } from "@/db/schema";

const MIN_PAGE = 1;
const MIN_PAGE_SIZE = 1;
const MAX_PAGE_SIZE = 100;

export function normalizePage(value: unknown): number {
  if (value === undefined || value === null) return MIN_PAGE;
  const num = Number(value);
  if (Number.isNaN(num)) return MIN_PAGE;
  const clamped = Math.max(MIN_PAGE, Math.floor(num));
  return clamped;
}

export function normalizePageSize(value: unknown): number {
  if (value === undefined || value === null) return MAX_PAGE_SIZE;
  const num = Number(value);
  if (Number.isNaN(num)) return MAX_PAGE_SIZE;
  const clamped = Math.min(MAX_PAGE_SIZE, Math.max(MIN_PAGE_SIZE, Math.floor(num)));
  return clamped;
}

export interface AuditEventInput {
  userId: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: unknown;
}

export interface AuditLogRow {
  id: string;
  userId: string | null;
  userName: string | null;
  userEmail: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  metadata: unknown;
  createdAt: Date;
}

export interface AuditLogFilters {
  action?: string;
  entityType?: string;
  userEmail?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface AuditRepository {
  insertAuditLog(event: AuditEventInput): Promise<void>;
  listAuditLogs(
    filters: AuditLogFilters,
    page: number,
    pageSize: number,
  ): Promise<{ rows: AuditLogRow[]; total: number }>;
}

export const dbAuditRepository: AuditRepository = {
  async insertAuditLog(event) {
    await db.insert(auditLogs).values({
      userId: event.userId,
      action: event.action,
      entityType: event.entityType,
      entityId: event.entityId ?? null,
      metadata: event.metadata ?? null,
    });
  },

  async listAuditLogs(filters, page, pageSize) {
    const safePage = normalizePage(page);
    const safePageSize = normalizePageSize(pageSize);

    const conditions: import("drizzle-orm").SQL[] = [];
    if (filters.action) conditions.push(eq(auditLogs.action, filters.action));
    if (filters.entityType) conditions.push(eq(auditLogs.entityType, filters.entityType));
    if (filters.dateFrom)
      conditions.push(gte(auditLogs.createdAt, new Date(`${filters.dateFrom}T00:00:00Z`)));
    if (filters.dateTo)
      conditions.push(lte(auditLogs.createdAt, new Date(`${filters.dateTo}T23:59:59Z`)));
    if (filters.userEmail) {
      conditions.push(
        or(
          ilike(users.email, `%${filters.userEmail.trim()}%`),
          ilike(users.name, `%${filters.userEmail.trim()}%`),
        )!,
      );
    }
    const where = conditions.length ? and(...conditions) : undefined;

    const rows = await db
      .select({
        id: auditLogs.id,
        userId: auditLogs.userId,
        userName: users.name,
        userEmail: users.email,
        action: auditLogs.action,
        entityType: auditLogs.entityType,
        entityId: auditLogs.entityId,
        metadata: auditLogs.metadata,
        createdAt: auditLogs.createdAt,
      })
      .from(auditLogs)
      .leftJoin(users, eq(auditLogs.userId, users.id))
      .where(where)
      .orderBy(desc(auditLogs.createdAt))
      .limit(safePageSize)
      .offset((safePage - 1) * safePageSize);

    const [countRow] = await db
      .select({ value: sql<number>`count(*)` })
      .from(auditLogs)
      .leftJoin(users, eq(auditLogs.userId, users.id))
      .where(where);

    return {
      rows: rows.map((r) => ({
        ...r,
        userName: r.userName ?? null,
        userEmail: r.userEmail ?? null,
        entityId: r.entityId ?? null,
        metadata: r.metadata ?? null,
      })),
      total: Number(countRow?.value ?? 0),
    };
  },
};

export async function logAuditEvent(
  userId: string | null,
  action: string,
  entityType: string,
  entityId?: string | null,
  metadata?: unknown,
  repo: AuditRepository = dbAuditRepository,
): Promise<void> {
  try {
    await repo.insertAuditLog({
      userId,
      action,
      entityType,
      entityId: entityId ?? null,
      metadata: metadata ?? null,
    });
  } catch {
    // L'audit ne doit jamais bloquer l'action principale.
  }
}
