"use server";

import { revalidatePath } from "next/cache";
import { assignByIdentifier, setAssignmentActive } from "@/lib/zones/assignments";
import { requireRoleAction } from "@/lib/auth/guard";

export type AssignmentFormState = { error?: string; success?: boolean };

const ERROR_MESSAGES: Record<string, string> = {
  zone_not_found: "Zone introuvable.",
  user_not_found: "Aucun utilisateur actif trouvé pour cet identifiant.",
  role_invalid: "Seuls les rôles superviseur et agent peuvent être responsables.",
  duplicate: "Cet utilisateur est déjà responsable de la zone.",
  not_found: "Affectation introuvable.",
};

export async function assignAction(
  zoneId: string,
  _prev: AssignmentFormState,
  formData: FormData,
): Promise<AssignmentFormState> {
  await requireRoleAction("admin");

  const identifier = String(formData.get("identifier") ?? "");
  const result = await assignByIdentifier(zoneId, identifier);

  if (!result.ok) {
    return { error: ERROR_MESSAGES[result.error] ?? "Échec de l'affectation." };
  }

  revalidatePath(`/admin/zones/${zoneId}/assignments`);
  return { success: true };
}

export async function removeAction(formData: FormData): Promise<void> {
  await requireRoleAction("admin");

  const assignmentId = String(formData.get("id") ?? "");
  const zoneId = String(formData.get("zoneId") ?? "");

  await setAssignmentActive(assignmentId, false);
  revalidatePath(`/admin/zones/${zoneId}/assignments`);
}
