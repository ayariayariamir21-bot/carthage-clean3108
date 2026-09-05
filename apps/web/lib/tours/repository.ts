import { and, asc, desc, eq, exists, gte, ilike, inArray, lte, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { tours, tourAgents, zones, users } from "@/db/schema";
import type { InsertTourData, TourRecord, TourRepository } from "./service";
import type { TourDetail, TourQueryOptions, TourQueryResult, TourQueryRow } from "./query";

const tourColumns = {
  id: tours.id,
  zoneId: tours.zoneId,
  zoneName: zones.name,
  date: tours.date,
  startTime: tours.startTime,
  endTime: tours.endTime,
  status: tours.status,
  notes: tours.notes,
  startedAt: tours.startedAt,
  completedAt: tours.completedAt,
  cancellationReason: tours.cancellationReason,
  createdBy: tours.createdBy,
  creatorName: users.name,
  createdAt: tours.createdAt,
  agentCount: sql<number>`(select count(*)::int from ${tourAgents} where ${tourAgents.tourId} = ${tours.id})`,
  zoneCode: zones.code,
  agentIds: sql<string[]>`(
    select coalesce(array_agg(${tourAgents.userId}::text order by ${tourAgents.userId}), array[]::text[])
    from ${tourAgents} where ${tourAgents.tourId} = ${tours.id}
  )`,
  agentNames: sql<string[]>`(
    select coalesce(array_agg(${users.name} order by ${users.name}), array[]::text[])
    from ${tourAgents} inner join ${users} on ${users.id} = ${tourAgents.userId}
    where ${tourAgents.tourId} = ${tours.id}
  )`,
  agentMatricules: sql<string[]>`(
    select coalesce(array_agg(${users.matricule} order by ${users.matricule}), array[]::text[])
    from ${tourAgents} inner join ${users} on ${users.id} = ${tourAgents.userId}
    where ${tourAgents.tourId} = ${tours.id}
  )`,
};

export const dbTourRepository: TourRepository = {
  async findZone(id) {
    const [zone] = await db
      .select({ id: zones.id, isActive: zones.isActive, name: zones.name })
      .from(zones)
      .where(eq(zones.id, id))
      .limit(1);
    return zone;
  },

  async findUserById(id) {
    const [user] = await db
      .select({ id: users.id, isActive: users.isActive, role: users.role })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    return user;
  },

  async insertTourWithAgents(data: InsertTourData, agentIds: string[]) {
    return db.transaction(async (tx) => {
      const [tour] = await tx.insert(tours).values(data).returning({ id: tours.id });
      if (!tour) {
        throw new Error("Échec de la création de la tournée.");
      }
      if (agentIds.length > 0) {
        await tx.insert(tourAgents).values(agentIds.map((userId) => ({ tourId: tour.id, userId })));
      }
      return tour;
    });
  },

  async listTours() {
    const rows = await db
      .select({
        id: tours.id,
        zoneId: tours.zoneId,
        zoneName: zones.name,
        date: tours.date,
        startTime: tours.startTime,
        endTime: tours.endTime,
        status: tours.status,
        notes: tours.notes,
        startedAt: tours.startedAt,
        completedAt: tours.completedAt,
        cancellationReason: tours.cancellationReason,
        createdBy: tours.createdBy,
        creatorName: users.name,
        createdAt: tours.createdAt,
        agentCount: sql<number>`(
          select count(*)::int from ${tourAgents} where ${tourAgents.tourId} = ${tours.id}
        )`,
      })
      .from(tours)
      .leftJoin(zones, eq(tours.zoneId, zones.id))
      .leftJoin(users, eq(tours.createdBy, users.id))
      .orderBy(desc(tours.date), desc(tours.createdAt));
    return rows.map((row) => ({
      ...row,
      notes: row.notes ?? null,
      startedAt: row.startedAt ?? null,
      completedAt: row.completedAt ?? null,
      cancellationReason: row.cancellationReason ?? null,
    })) as TourRecord[];
  },

  async findTour(id) {
    const [tour] = await db
      .select({ id: tours.id, date: tours.date, status: tours.status })
      .from(tours)
      .where(eq(tours.id, id))
      .limit(1);
    return tour ? { ...tour, status: tour.status } : undefined;
  },

  async findTourAgent(tourId, userId) {
    const [row] = await db
      .select({ tourId: tourAgents.tourId, userId: tourAgents.userId })
      .from(tourAgents)
      .where(and(eq(tourAgents.tourId, tourId), eq(tourAgents.userId, userId)))
      .limit(1);
    return row;
  },

  async updateTour(id, data) {
    await db
      .update(tours)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(tours.id, id));
  },

  async listTourIdsByUser(userId) {
    const rows = await db
      .select({ tourId: tourAgents.tourId })
      .from(tourAgents)
      .where(eq(tourAgents.userId, userId));
    return rows.map((r) => r.tourId);
  },

  async queryTours(options: TourQueryOptions): Promise<TourQueryResult> {
    const filters = options.filters ?? {};
    const conditions: import("drizzle-orm").SQL[] = [];

    if (filters.date) conditions.push(eq(tours.date, filters.date));
    if (filters.dateFrom) conditions.push(gte(tours.date, filters.dateFrom));
    if (filters.dateTo) conditions.push(lte(tours.date, filters.dateTo));
    if (filters.zoneId) conditions.push(eq(tours.zoneId, filters.zoneId));
    if (filters.status) conditions.push(eq(tours.status, filters.status));
    if (filters.creatorId) conditions.push(eq(tours.createdBy, filters.creatorId));
    if (filters.zoneCode) conditions.push(ilike(zones.code, `%${filters.zoneCode.trim()}%`));
    if (filters.agent) {
      const needle = `%${filters.agent.trim()}%`;
      conditions.push(
        exists(
          db
            .select({ v: sql`1` })
            .from(tourAgents)
            .innerJoin(users, eq(tourAgents.userId, users.id))
            .where(
              and(
                eq(tourAgents.tourId, tours.id),
                or(ilike(users.name, needle), ilike(users.matricule, needle)),
              ),
            ),
        ),
      );
    }
    if (filters.agentId) {
      conditions.push(
        exists(
          db
            .select({ v: sql`1` })
            .from(tourAgents)
            .where(and(eq(tourAgents.tourId, tours.id), eq(tourAgents.userId, filters.agentId))),
        ),
      );
    }

    const where = conditions.length ? and(...conditions) : undefined;

    const column = options.sort?.column ?? "date";
    const direction = options.sort?.direction ?? "desc";
    const orderExpr =
      column === "zone"
        ? zones.name
        : column === "creator"
          ? users.name
          : column === "status"
            ? tours.status
            : column === "startTime"
              ? tours.startTime
              : tours.date;
    const order = direction === "asc" ? asc(orderExpr) : desc(orderExpr);

    const page = Math.max(1, options.page ?? 1);
    const pageSize = Math.min(200, Math.max(1, options.pageSize ?? 20));
    const offset = (page - 1) * pageSize;

    const rows = await db
      .select(tourColumns)
      .from(tours)
      .leftJoin(zones, eq(tours.zoneId, zones.id))
      .leftJoin(users, eq(tours.createdBy, users.id))
      .where(where)
      .orderBy(order, desc(tours.createdAt))
      .limit(pageSize)
      .offset(offset);

    const [countRow] = await db
      .select({ value: sql<number>`count(*)` })
      .from(tours)
      .leftJoin(zones, eq(tours.zoneId, zones.id))
      .leftJoin(users, eq(tours.createdBy, users.id))
      .where(where);

    return {
      rows: rows.map((r) => ({
        ...r,
        notes: r.notes ?? null,
        startedAt: r.startedAt ?? null,
        completedAt: r.completedAt ?? null,
        cancellationReason: r.cancellationReason ?? null,
        zoneCode: r.zoneCode ?? null,
        agentIds: r.agentIds ?? [],
        agentNames: r.agentNames ?? [],
        agentMatricules: r.agentMatricules ?? [],
      })) as TourQueryRow[],
      total: Number(countRow?.value ?? 0),
    };
  },

  async getTourById(id) {
    const [row] = await db
      .select(tourColumns)
      .from(tours)
      .leftJoin(zones, eq(tours.zoneId, zones.id))
      .leftJoin(users, eq(tours.createdBy, users.id))
      .where(eq(tours.id, id))
      .limit(1);

    if (!row) return undefined;

    const agents = await db
      .select({
        id: users.id,
        name: users.name,
        matricule: users.matricule,
        email: users.email,
        role: users.role,
        isActive: users.isActive,
      })
      .from(tourAgents)
      .innerJoin(users, eq(tourAgents.userId, users.id))
      .where(eq(tourAgents.tourId, id));

    return {
      ...row,
      notes: row.notes ?? null,
      startedAt: row.startedAt ?? null,
      completedAt: row.completedAt ?? null,
      cancellationReason: row.cancellationReason ?? null,
      zoneCode: row.zoneCode ?? null,
      agentIds: row.agentIds ?? [],
      agentNames: row.agentNames ?? [],
      agentMatricules: row.agentMatricules ?? [],
      agents: agents.map((a) => ({ ...a, name: a.name ?? null, matricule: a.matricule ?? null })),
    } as TourDetail;
  },

  async listCreators() {
    const rows = await db
      .select({ id: users.id, name: users.name })
      .from(users)
      .where(inArray(users.role, ["admin", "supervisor"]))
      .orderBy(users.name);
    return rows;
  },
};
