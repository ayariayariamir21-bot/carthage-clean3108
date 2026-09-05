export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;

export type PasswordPolicy = string;

export function validatePassword(password: string): { ok: true } | { ok: false; error: string } {
  if (password.length < PASSWORD_MIN_LENGTH) {
    return {
      ok: false,
      error: `Le mot de passe doit contenir au moins ${PASSWORD_MIN_LENGTH} caractères`,
    };
  }
  if (password.length > PASSWORD_MAX_LENGTH) {
    return {
      ok: false,
      error: `Le mot de passe ne doit pas dépasser ${PASSWORD_MAX_LENGTH} caractères`,
    };
  }
  return { ok: true };
}

export function hasLeadingOrTrailingSpaces(password: string): boolean {
  return password.startsWith(" ") || password.endsWith(" ");
}

export function validatePasswordStrict(
  password: string,
): { ok: true } | { ok: false; error: string } {
  const basic = validatePassword(password);
  if (!basic.ok) return basic;

  if (hasLeadingOrTrailingSpaces(password)) {
    return {
      ok: false,
      error: "Le mot de passe ne doit pas commencer ou se terminer par un espace",
    };
  }

  return { ok: true };
}

export const PASSWORD_POLICY_DESCRIPTION = `
Politique de mots de passe :
- Longueur minimale : ${PASSWORD_MIN_LENGTH} caractères
- Longueur maximale : ${PASSWORD_MAX_LENGTH} caractères
- Les espaces en début et fin de mot de passe sont interdits (pour éviter les erreurs de saisie)
- Les espaces internes sont autorisés et font partie du mot de passe
- Tous les caractères saisis sont significatifs (pas de trim silencieux)
`.trim();
