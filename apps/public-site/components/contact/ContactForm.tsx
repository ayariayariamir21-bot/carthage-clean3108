"use client";

import { useEffect, useState } from "react";
import { useActionState } from "react";
import { Input, Textarea } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { submitContactAction, type ContactState } from "@/app/contact/actions";

const INITIAL: ContactState = {};

export function ContactForm() {
  const [state, formAction, pending] = useActionState(submitContactAction, INITIAL);
  const [sent, setSent] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  useEffect(() => {
    if (state.success) setSent(true);
  }, [state.success]);

  if (sent) {
    return (
      <div className="rounded-xl border border-accent-200 bg-accent-50 p-8 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent-600 text-white">
          <Icon name="check" size={28} />
        </span>
        <h3 className="mt-4 text-lg font-semibold text-slate-800">Message envoyé !</h3>
        <p className="mt-2 text-sm text-slate-600">
          Merci, votre message a bien été pris en compte. Notre équipe vous répondra dans les
          meilleurs délais.
        </p>
        <div className="mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setSent(false);
              setResetKey((key) => key + 1);
            }}
          >
            Envoyer un autre message
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form key={resetKey} action={formAction} className="space-y-4" noValidate>
      {state.error ? (
        <div
          role="alert"
          className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {state.error}
        </div>
      ) : null}

      <Input
        label="Nom complet"
        name="name"
        type="text"
        required
        autoComplete="name"
        icon="user"
        error={state.fieldErrors?.name}
      />

      <Input
        label="Email"
        name="email"
        type="email"
        required
        autoComplete="email"
        icon="mail"
        error={state.fieldErrors?.email}
      />

      <Textarea
        label="Message"
        name="message"
        required
        rows={5}
        icon="message"
        error={state.fieldErrors?.message}
      />

      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center justify-center gap-2 rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {pending ? (
          <>
            <svg
              className="h-4 w-4 animate-spin"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z"
              />
            </svg>
            Envoi en cours…
          </>
        ) : (
          <>
            Envoyer le message
            <Icon name="mail" size={16} />
          </>
        )}
      </button>
    </form>
  );
}
