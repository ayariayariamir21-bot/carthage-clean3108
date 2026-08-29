import { DEFAULT_LOCALE, LOCALES, type Locale } from "@carthage-clean/types";

const LABELS: Record<Locale, string> = {
  fr: "Français",
  ar: "العربية",
  en: "English",
};

export default function HomePage() {
  return (
    <main className="page">
      <h1>🧹 Carthage-Clean</h1>
      <p>
        Plateforme de gestion du nettoyage et de la propreté urbaine — projet{" "}
        <strong>Carthage-Clean</strong>.
      </p>

      <section>
        <h2>Langues supportées</h2>
        <ul>
          {LOCALES.map((locale) => (
            <li key={locale}>
              {LABELS[locale]}
              {locale === DEFAULT_LOCALE ? " (par défaut)" : ""}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
