"use server";

import { revalidatePath } from "next/cache";
import { createAgent, setAgentActive, setAgentMainZone, updateAgent } from "@/lib/auth/agents";
import { requireRoleAction } from "@/lib/auth/guard";

export type AgentFormState = { error?: string; success?: boolean };

const ERROR_MESSAGES: Record<string, string> = {
  invalid:
    "Données invalides (nom requis, email valide, mot de passe ≥ 8 caractères, téléphone/date corrects).",
  email_taken: "Cette adresse email est déjà utilisée.",
  not_found: "Agent introuvable.",
  user_not_found: "Utilisateur introuvable.",
  user_inactive: "L'utilisateur est désactivé.",
  role_invalid: "Seul un agent peut avoir un rattachement principal.",
  zone_not_found: "Zone introuvable.",
  zone_inactive: "La zone est désactivée.",
};

export async function createAgentAction(
  _prev: AgentFormState,
  formData: FormData,
): Promise<AgentFormState> {
  const user = await requireRoleAction("admin");

  const result = await createAgent(
    {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
      matricule: String(formData.get("matricule") ?? "") || undefined,
      phone: String(formData.get("phone") ?? "") || undefined,
      hireDate: String(formData.get("hireDate") ?? "") || undefined,
      team: String(formData.get("team") ?? "") || undefined,
      notes: String(formData.get("notes") ?? "") || undefined,
    },
    { actorId: user.id },
  );

  if (!result.ok) {
    return { error: ERROR_MESSAGES[result.error] ?? "Échec de la création." };
  }

  revalidatePath("/admin/agents");
  return { success: true };
}

export async function updateAgentAction(
  id: string,
  _prev: AgentFormState,
  formData: FormData,
): Promise<AgentFormState> {
  const user = await requireRoleAction("admin");

  const result = await updateAgent(
    id,
    {
      name: String(formData.get("name") ?? "") || undefined,
      email: String(formData.get("email") ?? "") || undefined,
      matricule: String(formData.get("matricule") ?? "") || undefined,
      phone: String(formData.get("phone") ?? "") || undefined,
      hireDate: String(formData.get("hireDate") ?? "") || undefined,
      team: String(formData.get("team") ?? "") || undefined,
      notes: String(formData.get("notes") ?? "") || undefined,
    },
    { actorId: user.id },
  );

  if (!result.ok) {
    return { error: ERROR_MESSAGES[result.error] ?? "Échec de la mise à jour." };
  }

  revalidatePath("/admin/agents");
  return { success: true };
}

export async function toggleAgentActiveAction(formData: FormData): Promise<void> {
  const user = await requireRoleAction("admin");

  const id = String(formData.get("id") ?? "");
  const active = formData.get("active") !== "true";

  await setAgentActive(id, active, { actorId: user.id });
  revalidatePath("/admin/agents");
}

export async function setMainZoneAction(
  userId: string,
  _prev: AgentFormState,
  formData: FormData,
): Promise<AgentFormState> {
  const user = await requireRoleAction("admin");

  const zoneId = String(formData.get("zoneId") ?? "");
  const result = await setAgentMainZone(userId, zoneId, { actorId: user.id });

  if (!result.ok) {
    return { error: ERROR_MESSAGES[result.error] ?? "Échec du rattachement." };
  }

  revalidatePath(`/admin/agents/${userId}/main-zone`);
  revalidatePath("/admin/agents");
  return { success: true };
}
