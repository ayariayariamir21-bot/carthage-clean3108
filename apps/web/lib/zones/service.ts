import { and, count, eq, ne } from "drizzle-orm";
import { db } from "@/db";
import { tours, zones } from "@/db/schema";
import { logAuditEvent } from "@/lib/audit/log";
import { validateZoneName, validateZoneCode, validateZoneDescription } from "./validation";

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
  countToursByZone(zoneId: string): Promise<number>;
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
  async countToursByZone(zoneId) {
    const [row] = await db.select({ value: count() }).from(tours).where(eq(tours.zoneId, zoneId));
    return Number(row?.value ?? 0);
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
  | { ok: true; zone: { id: string; code: string } }
  | {
      ok: false;
      error: "invalid" | "code_taken" | "name_too_long" | "code_too_long" | "description_too_long";
    };

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

  const nameValidation = validateZoneName(name);
  if (!nameValidation.ok) {
    const errorMap: Record<string, "name_too_long" | "invalid"> = {
      "Le nom de zone doit contenir au moins 1 caractère": "invalid",
      "Le nom de zone ne doit pas dépasser 100 caractères": "name_too_long",
    };
    return { ok: false, error: errorMap[nameValidation.error] ?? "invalid" };
  }

  const codeValidation = validateZoneCode(code);
  if (!codeValidation.ok) {
    const errorMap: Record<string, "code_too_long" | "invalid"> = {
      "Le code de zone doit contenir au moins 1 caractère": "invalid",
      "Le code de zone ne doit pas dépasser 20 caractères": "code_too_long",
    };
    return { ok: false, error: errorMap[codeValidation.error] ?? "invalid" };
  }

  const descriptionValidation = validateZoneDescription(description);
  if (!descriptionValidation.ok) {
    return { ok: false, error: "description_too_long" };
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
  | { ok: true }
  | {
      ok: false;
      error:
        | "not_found"
        | "invalid"
        | "code_taken"
        | "name_too_long"
        | "code_too_long"
        | "description_too_long";
    };

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

  if (input.name !== undefined) {
    const nameValidation = validateZoneName(name);
    if (!nameValidation.ok) {
      return { ok: false, error: "name_too_long" };
    }
  }

  if (input.code !== undefined) {
    const codeValidation = validateZoneCode(code);
    if (!codeValidation.ok) {
      return { ok: false, error: "code_too_long" };
    }
  }

  if (input.description !== undefined) {
    const descriptionValidation = validateZoneDescription(description);
    if (!descriptionValidation.ok) {
      return { ok: false, error: "description_too_long" };
    }
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

export type DeleteZoneResult =
  | { ok: true }
  | { ok: false; error: "not_found" | "has_tours" | "has_assignments" | "foreign_key" };

export async function deleteZone(id: string, opts: ZoneOptions = {}): Promise<DeleteZoneResult> {
  const repository = opts.repository ?? dbZoneRepository;

  const zone = await repository.findZoneById(id);
  if (!zone) {
    return { ok: false, error: "not_found" };
  }

  const tourCount = await repository.countToursByZone(id);
  if (tourCount > 0) {
    return { ok: false, error: "has_tours" };
  }

  try {
    await repository.deleteZone(id);
    await logAuditEvent(opts.actorId ?? null, "zone.delete", "zone", id, {
      name: zone.name,
      code: zone.code,
    });
    return { ok: true };
  } catch (err) {
    if (isForeignKeyError(err)) {
      return { ok: false, error: "foreign_key" };
    }
    throw err;
  }
}

function isForeignKeyError(err: unknown): boolean {
  if (err instanceof Error) {
    const message = err.message.toLowerCase();
    return (
      message.includes("foreign key") ||
      message.includes("fk_") ||
      message.includes("constraint") ||
      message.includes("violates") ||
      message.includes("restrict")
    );
  }
  return false;
}
