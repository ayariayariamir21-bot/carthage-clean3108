"use client";

import { useActionState } from "react";
import { createAgentAction, type AgentFormState } from "./actions";

const INITIAL: AgentFormState = {};

export function AgentCreateForm() {
  const [state, formAction] = useActionState(createAgentAction, INITIAL);

  return (
    <div className="card mb-8 max-w-2xl">
      <div className="card-header">
        <h2 className="text-lg font-semibold text-slate-800">Créer un agent</h2>
      </div>
      <form action={formAction} className="card-body space-y-4">
        {state.error ? (
          <div className="alert alert-error" role="alert">
            {state.error}
          </div>
        ) : null}
        {state.success ? (
          <div className="alert alert-info" role="status">
            Agent créé avec succès.
          </div>
        ) : null}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="field">
            <label className="label" htmlFor="agent-name">
              Nom
            </label>
            <input id="agent-name" name="name" type="text" required className="input" />
          </div>
          <div className="field">
            <label className="label" htmlFor="agent-email">
              Email
            </label>
            <input id="agent-email" name="email" type="email" required className="input" />
          </div>
          <div className="field">
            <label className="label" htmlFor="agent-password">
              Mot de passe temporaire
            </label>
            <input id="agent-password" name="password" type="text" required className="input" />
          </div>
          <div className="field">
            <label className="label" htmlFor="agent-matricule">
              Matricule (optionnel)
            </label>
            <input id="agent-matricule" name="matricule" type="text" className="input" />
          </div>
          <div className="field">
            <label className="label" htmlFor="agent-phone">
              Téléphone (optionnel)
            </label>
            <input id="agent-phone" name="phone" type="tel" className="input" />
          </div>
          <div className="field">
            <label className="label" htmlFor="agent-hireDate">
              Date d&apos;embauche (optionnelle)
            </label>
            <input id="agent-hireDate" name="hireDate" type="date" className="input" />
          </div>
        </div>
        <div className="field">
          <label className="label" htmlFor="agent-team">
            Équipe (optionnelle)
          </label>
          <input id="agent-team" name="team" type="text" className="input" />
        </div>
        <div className="field">
          <label className="label" htmlFor="agent-notes">
            Notes (optionnelles)
          </label>
          <textarea id="agent-notes" name="notes" className="input" rows={3} />
        </div>
        <button type="submit" className="btn btn-primary">
          Créer l&apos;agent
        </button>
      </form>
    </div>
  );
}
