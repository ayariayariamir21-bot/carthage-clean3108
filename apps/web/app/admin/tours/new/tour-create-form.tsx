"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createTourAction, type TourFormState } from "../actions";

const INITIAL: TourFormState = {};

export function TourCreateForm({
  zones,
  agents,
}: {
  zones: Array<{ id: string; name: string; code: string }>;
  agents: Array<{ id: string; name: string | null; matricule: string | null }>;
}) {
  const [state, formAction] = useActionState(createTourAction, INITIAL);
  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      router.push("/admin/tours");
    }
  }, [state.success, router]);

  return (
    <form action={formAction} className="card max-w-2xl">
      <div className="card-header">
        <h2 className="font-semibold text-slate-800">Nouvelle tournée</h2>
      </div>
      <div className="card-body space-y-4">
        {state.error ? (
          <div className="alert alert-error" role="alert">
            {state.error}
          </div>
        ) : null}

        <p className="text-sm text-slate-600">Le statut initial est fixé à « Planifiée ».</p>

        <div className="field">
          <label className="label" htmlFor="zoneId">
            Zone (active)
          </label>
          <select id="zoneId" name="zoneId" required className="input">
            <option value="">-- Choisir une zone --</option>
            {zones.map((zone) => (
              <option key={zone.id} value={zone.id}>
                {zone.name} ({zone.code})
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label className="label" htmlFor="date">
            Date
          </label>
          <input id="date" name="date" type="date" required className="input" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="field mb-0">
            <label className="label" htmlFor="startTime">
              Heure de début
            </label>
            <input id="startTime" name="startTime" type="time" required className="input" />
          </div>
          <div className="field mb-0">
            <label className="label" htmlFor="endTime">
              Heure de fin
            </label>
            <input id="endTime" name="endTime" type="time" required className="input" />
          </div>
        </div>

        <div className="field">
          <label className="label" htmlFor="agents">
            Équipe d&apos;agents (au moins un)
          </label>
          <select
            id="agents"
            name="agents"
            multiple
            required
            size={Math.min(Math.max(agents.length, 3), 8)}
            className="input"
          >
            {agents.length === 0 ? (
              <option value="">Aucun agent actif</option>
            ) : (
              agents.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.name ?? "Sans nom"} — {agent.matricule ?? "?"}
                </option>
              ))
            )}
          </select>
        </div>

        <div className="field">
          <label className="label" htmlFor="notes">
            Notes (optionnel)
          </label>
          <textarea id="notes" name="notes" rows={3} className="input" />
        </div>

        <button type="submit" className="btn btn-primary">
          Créer la tournée
        </button>
      </div>
    </form>
  );
}
