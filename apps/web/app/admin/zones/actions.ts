"use server";

import { revalidatePath } from "next/cache";
import { createZone, deleteZone, setZoneActive, updateZone } from "@/lib/zones/service";
import { requireRolesAction } from "@/lib/auth/guard";

const ZONE_ROLES = ["admin", "supervisor"] as const;

export type ZoneFormState = { error?: string; success?: boolean };

const ERROR_MESSAGES: Record<string, string> = {
  invalid: "Données invalides (nom et code requis).",
  code_taken: "Ce code existe déjà.",
  not_found: "Zone introuvable.",
  name_too_long: "Le nom de zone ne doit pas dépasser 100 caractères.",
  code_too_long: "Le code de zone ne doit pas dépasser 20 caractères.",
  description_too_long: "La description ne doit pas dépasser 500 caractères.",
  has_tours: "Impossible de supprimer : la zone a des tournées associées.",
  has_assignments: "Impossible de supprimer : la zone a des affectations.",
  foreign_key: "Impossible de supprimer : contrainte de clé étrangère.",
};

export async function createZoneAction(
  _prev: ZoneFormState,
  formData: FormData,
): Promise<ZoneFormState> {
  const user = await requireRolesAction([...ZONE_ROLES]);

  const result = await createZone(
    {
      name: String(formData.get("name") ?? ""),
      code: String(formData.get("code") ?? ""),
      description: String(formData.get("description") ?? "") || undefined,
    },
    { actorId: user.id },
  );

  if (!result.ok) {
    return { error: ERROR_MESSAGES[result.error] ?? "Échec de la création." };
  }

  revalidatePath("/admin/zones");
  return { success: true };
}

export async function updateZoneAction(
  id: string,
  _prev: ZoneFormState,
  formData: FormData,
): Promise<ZoneFormState> {
  const user = await requireRolesAction([...ZONE_ROLES]);

  const result = await updateZone(
    id,
    {
      name: String(formData.get("name") ?? "") || undefined,
      code: String(formData.get("code") ?? "") || undefined,
      description: String(formData.get("description") ?? "") || undefined,
    },
    { actorId: user.id },
  );

  if (!result.ok) {
    return { error: ERROR_MESSAGES[result.error] ?? "Échec de la mise à jour." };
  }

  revalidatePath("/admin/zones");
  return { success: true };
}

export async function toggleZoneActiveAction(formData: FormData): Promise<void> {
  const user = await requireRolesAction([...ZONE_ROLES]);

  const id = String(formData.get("id") ?? "");
  const active = formData.get("active") !== "true";

  await setZoneActive(id, active, { actorId: user.id });
  revalidatePath("/admin/zones");
}

export async function deleteZoneAction(formData: FormData): Promise<void> {
  await requireRolesAction([...ZONE_ROLES]);

  const id = String(formData.get("id") ?? "");
  const result = await deleteZone(id, { actorId: (await requireRolesAction([...ZONE_ROLES])).id });

  if (!result.ok) {
    throw new Error(ERROR_MESSAGES[result.error] ?? "Échec de la suppression.");
  }

  revalidatePath("/admin/zones");
}
