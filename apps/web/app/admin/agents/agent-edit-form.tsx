"use client";

import { useActionState } from "react";
import { updateAgentAction, type AgentFormState } from "./actions";
import type { AgentRecord } from "@/lib/auth/agents";

const INITIAL: AgentFormState = {};

export function AgentEditForm({ agent }: { agent: AgentRecord }) {
  const [state, formAction] = useActionState(updateAgentAction.bind(null, agent.id), INITIAL);

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
          <label className="label" htmlFor={`a-name-${agent.id}`}>
            Nom
          </label>
          <input
            id={`a-name-${agent.id}`}
            name="name"
            type="text"
            defaultValue={agent.name ?? ""}
            className="input"
          />
        </div>
        <div className="field mb-0">
          <label className="label" htmlFor={`a-email-${agent.id}`}>
            Email
          </label>
          <input
            id={`a-email-${agent.id}`}
            name="email"
            type="email"
            defaultValue={agent.email}
            className="input"
          />
        </div>
        <div className="field mb-0">
          <label className="label" htmlFor={`a-matricule-${agent.id}`}>
            Matricule
          </label>
          <input
            id={`a-matricule-${agent.id}`}
            name="matricule"
            type="text"
            defaultValue={agent.matricule ?? ""}
            className="input"
          />
        </div>
        <div className="field mb-0">
          <label className="label" htmlFor={`a-phone-${agent.id}`}>
            Téléphone
          </label>
          <input
            id={`a-phone-${agent.id}`}
            name="phone"
            type="tel"
            defaultValue={agent.phone ?? ""}
            className="input"
          />
        </div>
        <div className="field mb-0">
          <label className="label" htmlFor={`a-hire-${agent.id}`}>
            Date d&apos;embauche
          </label>
          <input
            id={`a-hire-${agent.id}`}
            name="hireDate"
            type="date"
            defaultValue={agent.hireDate ?? ""}
            className="input"
          />
        </div>
        <div className="field mb-0">
          <label className="label" htmlFor={`a-team-${agent.id}`}>
            Équipe
          </label>
          <input
            id={`a-team-${agent.id}`}
            name="team"
            type="text"
            defaultValue={agent.team ?? ""}
            className="input"
          />
        </div>
      </div>
      <div className="field mb-0">
        <label className="label" htmlFor={`a-notes-${agent.id}`}>
          Notes
        </label>
        <textarea
          id={`a-notes-${agent.id}`}
          name="notes"
          defaultValue={agent.notes ?? ""}
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
