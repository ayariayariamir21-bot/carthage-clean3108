import { and, eq, ne } from "drizzle-orm";
import { db } from "@/db";
import { sessions, users, zones } from "@/db/schema";
import { hashPassword } from "./password";
import type { Role } from "./rbac";
import { logAuditEvent, type AuditRepository } from "@/lib/audit/log";

export interface AgentRecord {
  id: string;
  name: string | null;
  email: string;
  matricule: string | null;
  isActive: boolean;
  role: Role;
  phone: string | null;
  hireDate: string | null;
  team: string | null;
  notes: string | null;
  defaultZoneId: string | null;
  defaultZoneName: string | null;
}

export interface AgentRepository {
  listAgents(): Promise<AgentRecord[]>;
  listUsers(): Promise<AgentRecord[]>;
  findAgentById(id: string): Promise<AgentRecord | undefined>;
  findUserByEmail(email: string): Promise<{ id: string } | undefined>;
  findUserByEmailExcluding(id: string, email: string): Promise<{ id: string } | undefined>;
  findZone(id: string): Promise<{ id: string; isActive: boolean } | undefined>;
  insertUser(data: {
    email: string;
    passwordHash: string;
    name: string | null;
    matricule: string | null;
    role: Role;
    isActive: boolean;
    phone: string | null;
    hireDate: string | null;
    team: string | null;
    notes: string | null;
    defaultZoneId: string | null;
  }): Promise<{ id: string; email: string }>;
  updateUser(
    id: string,
    data: Partial<{
      name: string | null;
      email: string;
      matricule: string | null;
      phone: string | null;
      hireDate: string | null;
      team: string | null;
      notes: string | null;
      defaultZoneId: string | null;
    }>,
  ): Promise<void>;
  setActive(id: string, isActive: boolean): Promise<void>;
  deleteSessions(userId: string): Promise<void>;
}

const BASE_SELECT = {
  id: users.id,
  name: users.name,
  email: users.email,
  matricule: users.matricule,
  isActive: users.isActive,
  role: users.role,
  phone: users.phone,
  hireDate: users.hireDate,
  team: users.team,
  notes: users.notes,
  defaultZoneId: users.defaultZoneId,
  defaultZoneName: zones.name,
} as const;

export const dbAgentRepository: AgentRepository = {
  async listAgents() {
    return db
      .select(BASE_SELECT)
      .from(users)
      .leftJoin(zones, eq(users.defaultZoneId, zones.id))
      .where(eq(users.role, "agent"));
  },
  async listUsers() {
    return db.select(BASE_SELECT).from(users).leftJoin(zones, eq(users.defaultZoneId, zones.id));
  },
  async findAgentById(id) {
    const rows = await db
      .select(BASE_SELECT)
      .from(users)
      .leftJoin(zones, eq(users.defaultZoneId, zones.id))
      .where(eq(users.id, id))
      .limit(1);
    return rows[0];
  },
  async findUserByEmail(email) {
    const rows = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    return rows[0];
  },
  async findUserByEmailExcluding(id, email) {
    const rows = await db
      .select({ id: users.id })
      .from(users)
      .where(and(eq(users.email, email), ne(users.id, id)))
      .limit(1);
    return rows[0];
  },
  async findZone(id) {
    const rows = await db
      .select({ id: zones.id, isActive: zones.isActive })
      .from(zones)
      .where(eq(zones.id, id))
      .limit(1);
    return rows[0];
  },
  async insertUser(data) {
    const [row] = await db
      .insert(users)
      .values(data)
      .returning({ id: users.id, email: users.email });
    if (!row) {
      throw new Error("Échec de la création de l'agent.");
    }
    return row;
  },
  async updateUser(id, data) {
    await db.update(users).set(data).where(eq(users.id, id));
  },
  async setActive(id, isActive) {
    await db.update(users).set({ isActive }).where(eq(users.id, id));
  },
  async deleteSessions(userId) {
    await db.delete(sessions).where(eq(sessions.userId, userId));
  },
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[+\d\s()-]{6,20}$/;
const MAX_TEAM_LENGTH = 100;
const MAX_NOTES_LENGTH = 2000;

export function isValidEmail(email: string): boolean {
  return EMAIL_PATTERN.test(email);
}

export function isValidPhone(phone: string): boolean {
  return PHONE_PATTERN.test(phone);
}

export function parseHireDate(value: string | undefined): string | null {
  if (!value || !value.trim()) {
    return null;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date.toISOString().slice(0, 10);
}

export interface CreateAgentInput {
  name: string;
  email: string;
  password: string;
  matricule?: string;
  phone?: string;
  hireDate?: string;
  team?: string;
  notes?: string;
}

export type CreateAgentResult =
  | { ok: true; user: { id: string; email: string } }
  | { ok: false; error: "invalid" | "email_taken" };

export interface AgentOptions {
  repository?: AgentRepository;
  hash?: (password: string) => Promise<string>;
  actorId?: string;
  audit?: AuditRepository;
}

export async function createAgent(
  input: CreateAgentInput,
  opts: AgentOptions = {},
): Promise<CreateAgentResult> {
  const repository = opts.repository ?? dbAgentRepository;
  const hash = opts.hash ?? hashPassword;

  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  const matricule = input.matricule?.trim() || null;
  const phone = input.phone?.trim() || null;
  const team = input.team?.trim() || null;
  const notes = input.notes?.trim() || null;
  const hireDate = parseHireDate(input.hireDate);

  if (!name || !isValidEmail(email) || input.password.length < 8) {
    return { ok: false, error: "invalid" };
  }
  if (phone !== null && !isValidPhone(phone)) {
    return { ok: false, error: "invalid" };
  }
  if (hireDate === null && input.hireDate && input.hireDate.trim()) {
    return { ok: false, error: "invalid" };
  }
  if (
    (team !== null && team.length > MAX_TEAM_LENGTH) ||
    (notes !== null && notes.length > MAX_NOTES_LENGTH)
  ) {
    return { ok: false, error: "invalid" };
  }

  const existing = await repository.findUserByEmail(email);
  if (existing) {
    return { ok: false, error: "email_taken" };
  }

  const passwordHash = await hash(input.password);
  const user = await repository.insertUser({
    email,
    passwordHash,
    name,
    matricule,
    role: "agent",
    isActive: true,
    phone,
    hireDate,
    team,
    notes,
    defaultZoneId: null,
  });

  await logAuditEvent(
    opts.actorId ?? null,
    "agent.create",
    "agent",
    user.id,
    {
      email,
      name,
      matricule,
    },
    opts.audit,
  );

  return { ok: true, user };
}

export interface UpdateAgentInput {
  name?: string;
  email?: string;
  matricule?: string;
  phone?: string;
  hireDate?: string;
  team?: string;
  notes?: string;
}

export type UpdateAgentResult =
  { ok: true } | { ok: false; error: "not_found" | "invalid" | "email_taken" };

export async function updateAgent(
  id: string,
  input: UpdateAgentInput,
  opts: AgentOptions = {},
): Promise<UpdateAgentResult> {
  const repository = opts.repository ?? dbAgentRepository;

  const agent = await repository.findAgentById(id);
  if (!agent) {
    return { ok: false, error: "not_found" };
  }

  const name = input.name !== undefined ? input.name.trim() : agent.name;
  const email = input.email !== undefined ? input.email.trim().toLowerCase() : agent.email;
  const matricule =
    input.matricule !== undefined ? input.matricule.trim() || null : agent.matricule;
  const phone = input.phone !== undefined ? input.phone.trim() || null : agent.phone;
  const team = input.team !== undefined ? input.team.trim() || null : agent.team;
  const notes = input.notes !== undefined ? input.notes.trim() || null : agent.notes;
  const hireDate = input.hireDate !== undefined ? parseHireDate(input.hireDate) : agent.hireDate;

  if (name !== null && !name) {
    return { ok: false, error: "invalid" };
  }
  if (!isValidEmail(email)) {
    return { ok: false, error: "invalid" };
  }
  if (phone !== null && !isValidPhone(phone)) {
    return { ok: false, error: "invalid" };
  }
  if (hireDate === null && input.hireDate !== undefined && input.hireDate.trim()) {
    return { ok: false, error: "invalid" };
  }
  if (
    (team !== null && team.length > MAX_TEAM_LENGTH) ||
    (notes !== null && notes.length > MAX_NOTES_LENGTH)
  ) {
    return { ok: false, error: "invalid" };
  }

  if (input.email !== undefined && email !== agent.email) {
    const taken = await repository.findUserByEmailExcluding(id, email);
    if (taken) {
      return { ok: false, error: "email_taken" };
    }
  }

  await repository.updateUser(id, { name, email, matricule, phone, hireDate, team, notes });
  await logAuditEvent(
    opts.actorId ?? null,
    "agent.update",
    "agent",
    id,
    {
      email,
      name,
      matricule,
    },
    opts.audit,
  );
  return { ok: true };
}

export type SetActiveResult = { ok: true } | { ok: false; error: "not_found" };

export async function setAgentActive(
  id: string,
  isActive: boolean,
  opts: AgentOptions = {},
): Promise<SetActiveResult> {
  const repository = opts.repository ?? dbAgentRepository;

  const agent = await repository.findAgentById(id);
  if (!agent) {
    return { ok: false, error: "not_found" };
  }

  await repository.setActive(id, isActive);
  if (!isActive) {
    await repository.deleteSessions(id);
  }

  await logAuditEvent(
    opts.actorId ?? null,
    isActive ? "agent.activate" : "agent.deactivate",
    "agent",
    id,
    undefined,
    opts.audit,
  );
  return { ok: true };
}

export type SetMainZoneResult =
  | { ok: true }
  | {
      ok: false;
      error:
        "user_not_found" | "user_inactive" | "role_invalid" | "zone_not_found" | "zone_inactive";
    };

export async function setAgentMainZone(
  userId: string,
  zoneId: string,
  opts: AgentOptions = {},
): Promise<SetMainZoneResult> {
  const repository = opts.repository ?? dbAgentRepository;

  const user = await repository.findAgentById(userId);
  if (!user) {
    return { ok: false, error: "user_not_found" };
  }
  if (!user.isActive) {
    return { ok: false, error: "user_inactive" };
  }
  if (user.role !== "agent") {
    return { ok: false, error: "role_invalid" };
  }

  const zone = await repository.findZone(zoneId);
  if (!zone) {
    return { ok: false, error: "zone_not_found" };
  }
  if (!zone.isActive) {
    return { ok: false, error: "zone_inactive" };
  }

  await repository.updateUser(userId, { defaultZoneId: zoneId });
  await logAuditEvent(
    opts.actorId ?? null,
    "agent.update",
    "agent",
    userId,
    { defaultZoneId: zoneId },
    opts.audit,
  );
  return { ok: true };
}
