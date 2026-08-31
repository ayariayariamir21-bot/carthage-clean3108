"use server";

import { revalidatePath } from "next/cache";
import { requireRolesAction } from "@/lib/auth/guard";
import { ALLOWED_TOUR_CREATOR_ROLES } from "@/lib/tours/service";
import { createTour } from "@/lib/tours/service";
import { cancelTour, completeTour, startTour } from "@/lib/tours/workflow";
import { dbTourRepository } from "@/lib/tours/repository";

export interface TourFormState {
  error?: string;
  success?: boolean;
  fieldErrors?: Record<string, string>;
}

export async function createTourAction(
  _prev: TourFormState,
  formData: FormData,
): Promise<TourFormState> {
  const user = await requireRolesAction(ALLOWED_TOUR_CREATOR_ROLES);

  const zoneId = String(formData.get("zoneId") ?? "").trim();
  const date = String(formData.get("date") ?? "").trim();
  const startTime = String(formData.get("startTime") ?? "").trim();
  const endTime = String(formData.get("endTime") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();
  const agentIds = formData
    .getAll("agents")
    .map((v) => String(v).trim())
    .filter(Boolean);

  const result = await createTour(
    { zoneId, date, startTime, endTime, notes, agentIds, createdBy: user.id },
    dbTourRepository,
  );

  if (!result.ok) {
    return { error: result.error };
  }

  revalidatePath("/admin/tours");
  return { success: true };
}

const STAFF_ROLES = ["admin", "supervisor", "agent"] as const;

export async function startTourAction(
  tourId: string,
  _prev: TourFormState,
  _formData: FormData,
): Promise<TourFormState> {
  const user = await requireRolesAction([...STAFF_ROLES]);
  const result = await startTour(tourId, user.id, dbTourRepository);
  if (!result.ok) {
    return { error: result.error };
  }
  revalidatePath("/admin/tours");
  revalidatePath("/admin/tours/today");
  return { success: true };
}

export async function completeTourAction(
  tourId: string,
  _prev: TourFormState,
  _formData: FormData,
): Promise<TourFormState> {
  const user = await requireRolesAction([...STAFF_ROLES]);
  const result = await completeTour(tourId, user.id, dbTourRepository);
  if (!result.ok) {
    return { error: result.error };
  }
  revalidatePath("/admin/tours");
  revalidatePath("/admin/tours/today");
  return { success: true };
}

export async function cancelTourAction(
  tourId: string,
  _prev: TourFormState,
  formData: FormData,
): Promise<TourFormState> {
  const user = await requireRolesAction([...STAFF_ROLES]);
  const reason = String(formData.get("reason") ?? "");
  const result = await cancelTour(tourId, user.id, reason, dbTourRepository);
  if (!result.ok) {
    return { error: result.error };
  }
  revalidatePath("/admin/tours");
  revalidatePath("/admin/tours/today");
  return { success: true };
}
