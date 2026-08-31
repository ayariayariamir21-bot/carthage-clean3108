"use client";

import { useActionState } from "react";
import { updateZoneAction, type ZoneFormState } from "./actions";
import type { ZoneRecord } from "@/lib/zones/service";

const INITIAL: ZoneFormState = {};

export function ZoneEditForm({ zone }: { zone: ZoneRecord }) {
  const [state, formAction] = useActionState(updateZoneAction.bind(null, zone.id), INITIAL);

  return (
    <form action={formAction} className="space-y-3">
      {state.error ? (
        <div className="alert alert-error" role="alert">
          {state.error}
        </div>
      ) : null}
      {state.success ? (
        <div className="alert alert-info" role="status">
          Mis à jour.
        </div>
      ) : null}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="field mb-0">
          <label className="label" htmlFor={`name-${zone.id}`}>
            Nom
          </label>
          <input
            id={`name-${zone.id}`}
            name="name"
            type="text"
            defaultValue={zone.name}
            required
            className="input"
          />
        </div>
        <div className="field mb-0">
          <label className="label" htmlFor={`code-${zone.id}`}>
            Code
          </label>
          <input
            id={`code-${zone.id}`}
            name="code"
            type="text"
            defaultValue={zone.code}
            required
            className="input"
          />
        </div>
      </div>
      <div className="field mb-0">
        <label className="label" htmlFor={`desc-${zone.id}`}>
          Description
        </label>
        <textarea
          id={`desc-${zone.id}`}
          name="description"
          defaultValue={zone.description ?? ""}
          className="input"
          rows={2}
        />
      </div>
      <button type="submit" className="btn btn-secondary btn-sm">
        Enregistrer
      </button>
    </form>
  );
}
