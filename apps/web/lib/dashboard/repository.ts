import { and, count, eq, gte, lte, sql } from "drizzle-orm";
import { db } from "@/db";
import { tours, users, zones } from "@/db/schema";
import { type TourStatus } from "@/db/schema";
import { dbTourRepository } from "@/lib/tours/repository";
import type { TourQueryRow } from "@/lib/tours/query";

export type TourStatusCounts = Record<TourStatus, number>;

export interface DashboardRepository {
  countToursByStatus(since: string, until: string): Promise<TourStatusCounts>;
  countActiveZones(): Promise<number>;
  countActiveAgents(): Promise<number>;
  listToursBetween(since: string, until: string): Promise<TourQueryRow[]>;
  listToursForUserBetween(userId: string, since: string, until: string): Promise<TourQueryRow[]>;
}

export const dbDashboardRepository: DashboardRepository = {
  async countToursByStatus(since, until) {
    const rows = await db
      .select({ status: tours.status, total: sql<number>`count(*)::int` })
      .from(tours)
      .where(and(gte(tours.date, since), lte(tours.date, until)))
      .groupBy(tours.status);

    const counts: TourStatusCounts = {
      planifiée: 0,
      en_cours: 0,
      terminée: 0,
      annulée: 0,
    };
    for (const row of rows) {
      counts[row.status] = row.total;
    }
    return counts;
  },

  async countActiveZones() {
    const [row] = await db.select({ value: count() }).from(zones).where(eq(zones.isActive, true));
    return Number(row?.value ?? 0);
  },

  async countActiveAgents() {
    const [row] = await db
      .select({ value: count() })
      .from(users)
      .where(and(eq(users.role, "agent"), eq(users.isActive, true)));
    return Number(row?.value ?? 0);
  },

  async listToursBetween(since, until) {
    const result = await dbTourRepository.queryTours({
      filters: { dateFrom: since, dateTo: until },
      pageSize: 1000,
      sort: { column: "date", direction: "asc" },
    });
    return result.rows;
  },

  async listToursForUserBetween(userId, since, until) {
    const result = await dbTourRepository.queryTours({
      filters: { dateFrom: since, dateTo: until, agentId: userId },
      pageSize: 1000,
      sort: { column: "date", direction: "asc" },
    });
    return result.rows;
  },
};
