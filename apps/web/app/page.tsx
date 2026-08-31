import { DEFAULT_LOCALE, LOCALES, type Locale } from "@carthage-clean/types";

const LABELS: Record<Locale, string> = {
  fr: "Français",
  ar: "العربية",
  en: "English",
};

export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-2xl">
        <div className="card card-body">
          <h1 className="mb-2 text-3xl font-bold text-brand-600">🧹 Carthage-Clean</h1>
          <p className="mb-6 text-slate-600">
            Plateforme de gestion du nettoyage et de la propreté urbaine — projet{" "}
            <strong>Carthage-Clean</strong>.
          </p>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-slate-800">Langues supportées</h2>
            <ul className="flex flex-wrap gap-2">
              {LOCALES.map((locale) => (
                <li key={locale} className="badge badge-neutral">
                  {LABELS[locale]}
                  {locale === DEFAULT_LOCALE ? " (par défaut)" : ""}
                </li>
              ))}
            </ul>
          </section>

          <div className="mt-8">
            <a href="/login" className="btn btn-primary">
              Se connecter
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
