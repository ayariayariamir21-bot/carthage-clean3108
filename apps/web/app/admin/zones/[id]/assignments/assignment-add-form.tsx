"use client";

import { useActionState } from "react";
import { assignAction, type AssignmentFormState } from "./actions";

const INITIAL: AssignmentFormState = {};

export function AssignmentAddForm({ zoneId }: { zoneId: string }) {
  const [state, formAction] = useActionState(assignAction.bind(null, zoneId), INITIAL);

  return (
    <div className="card mb-8 max-w-xl">
      <div className="card-header">
        <h3 className="font-semibold text-slate-800">Ajouter un responsable</h3>
      </div>
      <form action={formAction} className="card-body space-y-3">
        {state.error ? (
          <div className="alert alert-error" role="alert">
            {state.error}
          </div>
        ) : null}
        {state.success ? (
          <div className="alert alert-info" role="status">
            Responsable ajouté.
          </div>
        ) : null}
        <div className="field">
          <label className="label" htmlFor="assign-identifier">
            Email ou matricule de l&apos;utilisateur
          </label>
          <input id="assign-identifier" name="identifier" type="text" required className="input" />
        </div>
        <button type="submit" className="btn btn-primary">
          Affecter
        </button>
      </form>
    </div>
  );
}
