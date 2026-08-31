"use client";

import { useActionState } from "react";
import { createZoneAction, type ZoneFormState } from "./actions";

const INITIAL: ZoneFormState = {};

export function ZoneCreateForm() {
  const [state, formAction] = useActionState(createZoneAction, INITIAL);

  return (
    <div className="card mb-8 max-w-xl">
      <div className="card-header">
        <h2 className="text-lg font-semibold text-slate-800">Créer une zone</h2>
      </div>
      <form action={formAction} className="card-body space-y-4">
        {state.error ? (
          <div className="alert alert-error" role="alert">
            {state.error}
          </div>
        ) : null}
        {state.success ? (
          <div className="alert alert-info" role="status">
            Zone créée avec succès.
          </div>
        ) : null}
        <div className="field">
          <label className="label" htmlFor="zone-name">
            Nom
          </label>
          <input id="zone-name" name="name" type="text" required className="input" />
        </div>
        <div className="field">
          <label className="label" htmlFor="zone-code">
            Code (ex. Z01, NORD-A)
          </label>
          <input id="zone-code" name="code" type="text" required className="input" />
        </div>
        <div className="field">
          <label className="label" htmlFor="zone-desc">
            Description (optionnelle)
          </label>
          <textarea id="zone-desc" name="description" className="input" rows={3} />
        </div>
        <button type="submit" className="btn btn-primary">
          Créer la zone
        </button>
      </form>
    </div>
  );
}
