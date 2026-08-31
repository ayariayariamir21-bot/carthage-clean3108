import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { users, zoneAssignments, zones } from "@/db/schema";
import type { Role } from "@/lib/auth/rbac";

export const ASSIGNABLE_ROLES: Role[] = ["supervisor", "agent"];

export interface ZoneAssignmentUser {
  id: string;
  name: string | null;
  email: string;
  matricule: string | null;
  role: Role;
}

export interface ZoneAssignmentRecord {
  id: string;
  zoneId: string;
  userId: string;
  isActive: boolean;
  assignedAt: Date;
  user: ZoneAssignmentUser;
}

export interface AssignmentRepository {
  findZone(id: string): Promise<{ id: string } | undefined>;
  findUserById(id: string): Promise<{ id: string; role: Role; isActive: boolean } | undefined>;
  findUserByIdentifier(
    identifier: string,
  ): Promise<{ id: string; role: Role; isActive: boolean } | undefined>;
  findActiveAssignment(zoneId: string, userId: string): Promise<{ id: string } | undefined>;
  insertAssignment(data: {
    zoneId: string;
    userId: string;
    isActive: boolean;
    assignedAt: Date;
  }): Promise<{ id: string }>;
  listAssignments(zoneId: string): Promise<ZoneAssignmentRecord[]>;
  findAssignment(id: string): Promise<{ id: string; isActive: boolean } | undefined>;
  setAssignmentActive(id: string, isActive: boolean): Promise<void>;
}

export const dbAssignmentRepository: AssignmentRepository = {
  async findZone(id) {
    const rows = await db.select({ id: zones.id }).from(zones).where(eq(zones.id, id)).limit(1);
    return rows[0];
  },
  async findUserById(id) {
    const rows = await db
      .select({ id: users.id, role: users.role, isActive: users.isActive })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    return rows[0];
  },
  async findUserByIdentifier(identifier) {
    const normalized = identifier.trim().toLowerCase();
    const rows = await db
      .select({ id: users.id, role: users.role, isActive: users.isActive })
      .from(users)
      .where(and(eq(users.email, normalized), eq(users.isActive, true)))
      .limit(1);
    if (rows[0]) return rows[0];
    const byMatricule = await db
      .select({ id: users.id, role: users.role, isActive: users.isActive })
      .from(users)
      .where(and(eq(users.matricule, identifier.trim()), eq(users.isActive, true)))
      .limit(1);
    return byMatricule[0];
  },
  async findActiveAssignment(zoneId, userId) {
    const rows = await db
      .select({ id: zoneAssignments.id })
      .from(zoneAssignments)
      .where(
        and(
          eq(zoneAssignments.zoneId, zoneId),
          eq(zoneAssignments.userId, userId),
          eq(zoneAssignments.isActive, true),
        ),
      )
      .limit(1);
    return rows[0];
  },
  async insertAssignment(data) {
    const [row] = await db
      .insert(zoneAssignments)
      .values(data)
      .returning({ id: zoneAssignments.id });
    if (!row) {
      throw new Error("Échec de la création de l'affectation.");
    }
    return row;
  },
  async listAssignments(zoneId) {
    const rows = await db
      .select({
        id: zoneAssignments.id,
        zoneId: zoneAssignments.zoneId,
        userId: zoneAssignments.userId,
        isActive: zoneAssignments.isActive,
        assignedAt: zoneAssignments.assignedAt,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
          matricule: users.matricule,
          role: users.role,
        },
      })
      .from(zoneAssignments)
      .innerJoin(users, eq(zoneAssignments.userId, users.id))
      .where(and(eq(zoneAssignments.zoneId, zoneId), eq(zoneAssignments.isActive, true)));
    return rows;
  },
  async findAssignment(id) {
    const rows = await db
      .select({ id: zoneAssignments.id, isActive: zoneAssignments.isActive })
      .from(zoneAssignments)
      .where(eq(zoneAssignments.id, id))
      .limit(1);
    return rows[0];
  },
  async setAssignmentActive(id, isActive) {
    await db.update(zoneAssignments).set({ isActive }).where(eq(zoneAssignments.id, id));
  },
};

export type AssignResult =
  | { ok: true; assignment: { id: string } }
  | { ok: false; error: "zone_not_found" | "user_not_found" | "role_invalid" | "duplicate" };

export interface AssignmentOptions {
  repository?: AssignmentRepository;
}

export async function assignUserToZone(
  zoneId: string,
  userId: string,
  opts: AssignmentOptions = {},
): Promise<AssignResult> {
  const repository = opts.repository ?? dbAssignmentRepository;

  const zone = await repository.findZone(zoneId);
  if (!zone) {
    return { ok: false, error: "zone_not_found" };
  }

  const user = await repository.findUserById(userId);
  if (!user || !user.isActive) {
    return { ok: false, error: "user_not_found" };
  }
  if (!ASSIGNABLE_ROLES.includes(user.role)) {
    return { ok: false, error: "role_invalid" };
  }

  const existing = await repository.findActiveAssignment(zoneId, userId);
  if (existing) {
    return { ok: false, error: "duplicate" };
  }

  const assignment = await repository.insertAssignment({
    zoneId,
    userId,
    isActive: true,
    assignedAt: new Date(),
  });

  return { ok: true, assignment };
}

export async function assignByIdentifier(
  zoneId: string,
  identifier: string,
  opts: AssignmentOptions = {},
): Promise<AssignResult> {
  const repository = opts.repository ?? dbAssignmentRepository;

  const user = await repository.findUserByIdentifier(identifier);
  if (!user) {
    return { ok: false, error: "user_not_found" };
  }

  return assignUserToZone(zoneId, user.id, opts);
}

export type RemoveAssignmentResult = { ok: true } | { ok: false; error: "not_found" };

export async function setAssignmentActive(
  assignmentId: string,
  isActive: boolean,
  opts: AssignmentOptions = {},
): Promise<RemoveAssignmentResult> {
  const repository = opts.repository ?? dbAssignmentRepository;

  const assignment = await repository.findAssignment(assignmentId);
  if (!assignment) {
    return { ok: false, error: "not_found" };
  }

  await repository.setAssignmentActive(assignmentId, isActive);
  return { ok: true };
}
