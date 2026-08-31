import type { Role } from "@/lib/auth/rbac";
import {
  dbDashboardRepository,
  type DashboardRepository,
  type TourStatusCounts,
} from "./repository";
import type { TourQueryRow } from "@/lib/tours/query";

export interface DashboardInput {
  id: string;
  role: Role;
}

export interface AdminDashboard {
  role: "admin" | "supervisor";
  countsByStatus: TourStatusCounts;
  activeZones: number;
  activeAgents: number;
  todayTours: TourQueryRow[];
}

export interface AgentDashboard {
  role: "agent";
  myTours: TourQueryRow[];
  upcomingCount: number;
}

export type DashboardData = AdminDashboard | AgentDashboard;

function todayStr(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

export async function getDashboardData(
  user: DashboardInput,
  repository: DashboardRepository = dbDashboardRepository,
): Promise<DashboardData> {
  const today = todayStr();

  if (user.role === "admin" || user.role === "supervisor") {
    const [countsByStatus, activeZones, activeAgents, todayTours] = await Promise.all([
      repository.countToursByStatus(today, today),
      repository.countActiveZones(),
      repository.countActiveAgents(),
      repository.listToursBetween(today, today),
    ]);
    return { role: user.role, countsByStatus, activeZones, activeAgents, todayTours };
  }

  const myTours = await repository.listToursForUserBetween(user.id, today, "2999-12-31");
  return { role: "agent", myTours, upcomingCount: myTours.length };
}
