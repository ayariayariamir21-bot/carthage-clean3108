"use server";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import { changePassword } from "@/lib/auth/service";

export type ChangePasswordState = { error?: string };

export async function changePasswordAction(
  _prevState: ChangePasswordState,
  formData: FormData,
): Promise<ChangePasswordState> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!currentPassword || !newPassword || !confirmPassword) {
    return { error: "Tous les champs sont obligatoires." };
  }

  if (newPassword !== confirmPassword) {
    return { error: "Les nouveaux mots de passe ne correspondent pas." };
  }

  if (newPassword.length < 8) {
    return { error: "Le nouveau mot de passe doit contenir au moins 8 caractères." };
  }

  const result = await changePassword({
    userId: user.id,
    currentPassword,
    newPassword,
  });

  if (!result.ok) {
    switch (result.error) {
      case "invalid_current_password":
        return { error: "Mot de passe actuel incorrect." };
      case "user_not_found":
        return { error: "Utilisateur introuvable." };
      case "weak_password":
        return { error: "Le nouveau mot de passe est trop court." };
      default:
        return { error: "Une erreur est survenue." };
    }
  }

  redirect("/dashboard");
}
