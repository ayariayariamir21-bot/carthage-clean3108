"use client";

import { useActionState } from "react";
import { loginAction } from "./actions";

export default function LoginPage() {
  const [state, formAction] = useActionState(loginAction, {});

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-brand-600">🧹 Carthage-Clean</h1>
          <p className="text-sm text-slate-500">Plateforme de gestion de la propreté urbaine</p>
        </div>
        <div className="card card-body">
          <h2 className="mb-4 text-lg font-semibold text-slate-800">Connexion</h2>
          {state.error ? (
            <div className="alert alert-error mb-4" role="alert">
              {state.error}
            </div>
          ) : null}
          <form action={formAction} className="space-y-4">
            <div className="field">
              <label className="label" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                className="input"
                type="email"
                name="email"
                required
                autoComplete="email"
              />
            </div>
            <div className="field">
              <label className="label" htmlFor="password">
                Mot de passe
              </label>
              <input
                id="password"
                className="input"
                type="password"
                name="password"
                required
                autoComplete="current-password"
              />
            </div>
            <button type="submit" className="btn btn-primary w-full">
              Se connecter
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
