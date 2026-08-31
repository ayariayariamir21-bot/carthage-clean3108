"use client";

import { useActionState } from "react";
import { setMainZoneAction, type AgentFormState } from "../../actions";

const INITIAL: AgentFormState = {};

export function MainZoneForm({
  userId,
  zones,
  currentZoneId,
  currentZoneName,
}: {
  userId: string;
  zones: Array<{ id: string; name: string; code: string }>;
  currentZoneId: string | null;
  currentZoneName: string | null;
}) {
  const [state, formAction] = useActionState(setMainZoneAction.bind(null, userId), INITIAL);

  return (
    <div className="card max-w-xl">
      <div className="card-header">
        <h2 className="font-semibold text-slate-800">Zone actuellement définie</h2>
      </div>
      <form action={formAction} className="card-body space-y-4">
        {state.error ? (
          <div className="alert alert-error" role="alert">
            {state.error}
          </div>
        ) : null}
        {state.success ? (
          <div className="alert alert-info" role="status">
            Rattachement enregistré.
          </div>
        ) : null}

        <p className="text-sm text-slate-600">
          <strong>{currentZoneName ?? "Aucune"}</strong>
        </p>

        <div className="field">
          <label className="label" htmlFor="main-zone">
            Choisir la zone principale (active)
          </label>
          <select id="main-zone" name="zoneId" defaultValue={currentZoneId ?? ""} className="input">
            <option value="">-- Aucune --</option>
            {zones.map((zone) => (
              <option key={zone.id} value={zone.id}>
                {zone.name} ({zone.code})
              </option>
            ))}
          </select>
        </div>

        {zones.length === 0 ? (
          <p className="text-sm text-red-600">Aucune zone active disponible.</p>
        ) : null}

        <button type="submit" className="btn btn-primary">
          Enregistrer le rattachement
        </button>
      </form>
    </div>
  );
}
