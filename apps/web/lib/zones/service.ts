import { and, eq, ne } from "drizzle-orm";
import { db } from "@/db";
import { zones } from "@/db/schema";
import { logAuditEvent } from "@/lib/audit/log";

export interface ZoneRecord {
  id: string;
  name: string;
  code: string;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ZoneRepository {
  listZones(): Promise<ZoneRecord[]>;
  findZoneById(id: string): Promise<ZoneRecord | undefined>;
  findZoneByCode(code: string): Promise<{ id: string } | undefined>;
  findZoneByCodeExcluding(id: string, code: string): Promise<{ id: string } | undefined>;
  insertZone(data: {
    name: string;
    code: string;
    description: string | null;
  }): Promise<{ id: string; code: string }>;
  updateZone(
    id: string,
    data: Partial<{ name: string; code: string; description: string | null }>,
  ): Promise<void>;
  setActive(id: string, isActive: boolean): Promise<void>;
  deleteZone(id: string): Promise<void>;
}

export const dbZoneRepository: ZoneRepository = {
  async listZones() {
    return db.select().from(zones).orderBy(zones.code);
  },
  async findZoneById(id) {
    const rows = await db.select().from(zones).where(eq(zones.id, id)).limit(1);
    return rows[0];
  },
  async findZoneByCode(code) {
    const rows = await db.select({ id: zones.id }).from(zones).where(eq(zones.code, code)).limit(1);
    return rows[0];
  },
  async findZoneByCodeExcluding(id, code) {
    const rows = await db
      .select({ id: zones.id })
      .from(zones)
      .where(and(eq(zones.code, code), ne(zones.id, id)))
      .limit(1);
    return rows[0];
  },
  async insertZone(data) {
    const [row] = await db.insert(zones).values(data).returning({ id: zones.id, code: zones.code });
    if (!row) {
      throw new Error("Échec de la création de la zone.");
    }
    return row;
  },
  async updateZone(id, data) {
    await db
      .update(zones)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(zones.id, id));
  },
  async setActive(id, isActive) {
    await db.update(zones).set({ isActive, updatedAt: new Date() }).where(eq(zones.id, id));
  },
  async deleteZone(id) {
    await db.delete(zones).where(eq(zones.id, id));
  },
};

export function normalizeCode(code: string): string {
  return code.trim().toUpperCase();
}

export interface CreateZoneInput {
  name: string;
  code: string;
  description?: string;
}

export type CreateZoneResult =
  { ok: true; zone: { id: string; code: string } } | { ok: false; error: "invalid" | "code_taken" };

export interface ZoneOptions {
  repository?: ZoneRepository;
  actorId?: string;
}

export async function createZone(
  input: CreateZoneInput,
  opts: ZoneOptions = {},
): Promise<CreateZoneResult> {
  const repository = opts.repository ?? dbZoneRepository;

  const name = input.name.trim();
  const code = normalizeCode(input.code);
  const description = input.description?.trim() || null;

  if (!name || !code) {
    return { ok: false, error: "invalid" };
  }

  const existing = await repository.findZoneByCode(code);
  if (existing) {
    return { ok: false, error: "code_taken" };
  }

  const zone = await repository.insertZone({ name, code, description });
  await logAuditEvent(opts.actorId ?? null, "zone.create", "zone", zone.id, { name, code });
  return { ok: true, zone };
}

export interface UpdateZoneInput {
  name?: string;
  code?: string;
  description?: string;
}

export type UpdateZoneResult =
  { ok: true } | { ok: false; error: "not_found" | "invalid" | "code_taken" };

export async function updateZone(
  id: string,
  input: UpdateZoneInput,
  opts: ZoneOptions = {},
): Promise<UpdateZoneResult> {
  const repository = opts.repository ?? dbZoneRepository;

  const zone = await repository.findZoneById(id);
  if (!zone) {
    return { ok: false, error: "not_found" };
  }

  const name = input.name !== undefined ? input.name.trim() : zone.name;
  const code = input.code !== undefined ? normalizeCode(input.code) : zone.code;
  const description =
    input.description !== undefined ? input.description.trim() || null : zone.description;

  if (!name || !code) {
    return { ok: false, error: "invalid" };
  }

  if (input.code !== undefined && code !== zone.code) {
    const taken = await repository.findZoneByCodeExcluding(id, code);
    if (taken) {
      return { ok: false, error: "code_taken" };
    }
  }

  await repository.updateZone(id, { name, code, description });
  await logAuditEvent(opts.actorId ?? null, "zone.update", "zone", id, { name, code });
  return { ok: true };
}

export type SetActiveResult = { ok: true } | { ok: false; error: "not_found" };

export async function setZoneActive(
  id: string,
  isActive: boolean,
  opts: ZoneOptions = {},
): Promise<SetActiveResult> {
  const repository = opts.repository ?? dbZoneRepository;

  const zone = await repository.findZoneById(id);
  if (!zone) {
    return { ok: false, error: "not_found" };
  }

  await repository.setActive(id, isActive);
  await logAuditEvent(
    opts.actorId ?? null,
    isActive ? "zone.activate" : "zone.deactivate",
    "zone",
    id,
  );
  return { ok: true };
}

export type DeleteZoneResult = { ok: true } | { ok: false; error: "not_found" };

export async function deleteZone(id: string, opts: ZoneOptions = {}): Promise<DeleteZoneResult> {
  const repository = opts.repository ?? dbZoneRepository;

  const zone = await repository.findZoneById(id);
  if (!zone) {
    return { ok: false, error: "not_found" };
  }

  await repository.deleteZone(id);
  return { ok: true };
}
