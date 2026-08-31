import Link from "next/link";

export default function ForbiddenPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="text-5xl" aria-hidden>
        🚫
      </div>
      <h1 className="text-2xl font-bold text-slate-800">Accès refusé</h1>
      <p className="max-w-md text-slate-600">
        Vous n&apos;avez pas les droits nécessaires pour consulter cette page.
      </p>
      <Link href="/dashboard" className="btn btn-secondary">
        Retour au tableau de bord
      </Link>
    </main>
  );
}
