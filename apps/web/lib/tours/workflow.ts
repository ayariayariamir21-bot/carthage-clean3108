import { Role } from "@/lib/auth/rbac";
import type { TourRepository } from "./service";
import { dbAuditRepository, logAuditEvent, type AuditRepository } from "@/lib/audit/log";

export type WorkflowErrorCode =
  | "tour_not_found"
  | "user_not_found"
  | "permission_denied"
  | "invalid_status_transition"
  | "reason_required"
  | "tour_not_today";

export interface WorkflowError {
  ok: false;
  error: string;
  code: WorkflowErrorCode;
}

export interface WorkflowSuccess {
  ok: true;
}

export type WorkflowResult = WorkflowSuccess | WorkflowError;

function isStaffAllowed(role: Role): boolean {
  return role === "admin" || role === "supervisor";
}

function todayStr(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

export async function startTour(
  tourId: string,
  userId: string,
  repository: TourRepository,
  audit: AuditRepository = dbAuditRepository,
): Promise<WorkflowResult> {
  const tour = await repository.findTour(tourId);
  if (!tour) {
    return { ok: false, error: "Tournée introuvable.", code: "tour_not_found" };
  }

  const user = await repository.findUserById(userId);
  if (!user) {
    return { ok: false, error: "Utilisateur introuvable.", code: "user_not_found" };
  }

  if (tour.status !== "planifiée") {
    return {
      ok: false,
      error: "Seule une tournée planifiée peut être démarrée.",
      code: "invalid_status_transition",
    };
  }

  if (!isStaffAllowed(user.role)) {
    const assignment = await repository.findTourAgent(tourId, userId);
    if (!assignment) {
      return {
        ok: false,
        error: "Vous n'êtes pas assigné à cette tournée.",
        code: "permission_denied",
      };
    }
  }

  if (tour.date > todayStr()) {
    return {
      ok: false,
      error: "Impossible de démarrer une tournée dont la date est dans le futur.",
      code: "tour_not_today",
    };
  }

  await repository.updateTour(tourId, { status: "en_cours", startedAt: new Date() });
  await logAuditEvent(userId, "tour.start", "tour", tourId, undefined, audit);
  return { ok: true };
}

export async function completeTour(
  tourId: string,
  userId: string,
  repository: TourRepository,
  audit: AuditRepository = dbAuditRepository,
): Promise<WorkflowResult> {
  const tour = await repository.findTour(tourId);
  if (!tour) {
    return { ok: false, error: "Tournée introuvable.", code: "tour_not_found" };
  }

  const user = await repository.findUserById(userId);
  if (!user) {
    return { ok: false, error: "Utilisateur introuvable.", code: "user_not_found" };
  }

  if (tour.status !== "en_cours") {
    return {
      ok: false,
      error: "Seule une tournée en cours peut être terminée.",
      code: "invalid_status_transition",
    };
  }

  if (!isStaffAllowed(user.role)) {
    const assignment = await repository.findTourAgent(tourId, userId);
    if (!assignment) {
      return {
        ok: false,
        error: "Vous n'êtes pas assigné à cette tournée.",
        code: "permission_denied",
      };
    }
  }

  await repository.updateTour(tourId, { status: "terminée", completedAt: new Date() });
  await logAuditEvent(userId, "tour.complete", "tour", tourId, undefined, audit);
  return { ok: true };
}

export async function cancelTour(
  tourId: string,
  userId: string,
  reason: string,
  repository: TourRepository,
  audit: AuditRepository = dbAuditRepository,
): Promise<WorkflowResult> {
  const tour = await repository.findTour(tourId);
  if (!tour) {
    return { ok: false, error: "Tournée introuvable.", code: "tour_not_found" };
  }

  const user = await repository.findUserById(userId);
  if (!user) {
    return { ok: false, error: "Utilisateur introuvable.", code: "user_not_found" };
  }

  if (!isStaffAllowed(user.role)) {
    return {
      ok: false,
      error: "Seul un administrateur ou un superviseur peut annuler une tournée.",
      code: "permission_denied",
    };
  }

  if (tour.status !== "planifiée" && tour.status !== "en_cours") {
    return {
      ok: false,
      error: "Seule une tournée planifiée ou en cours peut être annulée.",
      code: "invalid_status_transition",
    };
  }

  const trimmedReason = reason.trim();
  if (!trimmedReason) {
    return { ok: false, error: "Une raison d'annulation est requise.", code: "reason_required" };
  }

  await repository.updateTour(tourId, {
    status: "annulée",
    cancellationReason: trimmedReason,
  });
  await logAuditEvent(userId, "tour.cancel", "tour", tourId, { reason: trimmedReason }, audit);
  return { ok: true };
}
