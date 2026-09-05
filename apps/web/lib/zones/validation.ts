export const ZONE_NAME_MIN_LENGTH = 1;
export const ZONE_NAME_MAX_LENGTH = 100;

export const ZONE_CODE_MIN_LENGTH = 1;
export const ZONE_CODE_MAX_LENGTH = 20;

export const ZONE_DESCRIPTION_MAX_LENGTH = 500;

export function validateZoneName(name: string): { ok: true } | { ok: false; error: string } {
  const trimmed = name.trim();
  if (trimmed.length < ZONE_NAME_MIN_LENGTH) {
    return {
      ok: false,
      error: `Le nom de zone doit contenir au moins ${ZONE_NAME_MIN_LENGTH} caractère`,
    };
  }
  if (trimmed.length > ZONE_NAME_MAX_LENGTH) {
    return {
      ok: false,
      error: `Le nom de zone ne doit pas dépasser ${ZONE_NAME_MAX_LENGTH} caractères`,
    };
  }
  return { ok: true };
}

export function validateZoneCode(code: string): { ok: true } | { ok: false; error: string } {
  const normalized = code.trim().toUpperCase();
  if (normalized.length < ZONE_CODE_MIN_LENGTH) {
    return {
      ok: false,
      error: `Le code de zone doit contenir au moins ${ZONE_CODE_MIN_LENGTH} caractère`,
    };
  }
  if (normalized.length > ZONE_CODE_MAX_LENGTH) {
    return {
      ok: false,
      error: `Le code de zone ne doit pas dépasser ${ZONE_CODE_MAX_LENGTH} caractères`,
    };
  }
  return { ok: true };
}

export function validateZoneDescription(
  description: string | null | undefined,
): { ok: true } | { ok: false; error: string } {
  if (description === null || description === undefined) {
    return { ok: true };
  }
  const trimmed = description.trim();
  if (trimmed.length > ZONE_DESCRIPTION_MAX_LENGTH) {
    return {
      ok: false,
      error: `La description ne doit pas dépasser ${ZONE_DESCRIPTION_MAX_LENGTH} caractères`,
    };
  }
  return { ok: true };
}

export const ZONE_VALIDATION_DESCRIPTION = `
Validation des zones :
- Nom : ${ZONE_NAME_MIN_LENGTH} à ${ZONE_NAME_MAX_LENGTH} caractères
- Code : ${ZONE_CODE_MIN_LENGTH} à ${ZONE_CODE_MAX_LENGTH} caractères (normalisé en majuscules, sans espaces)
- Description : max ${ZONE_DESCRIPTION_MAX_LENGTH} caractères (optionnelle)
`.trim();
