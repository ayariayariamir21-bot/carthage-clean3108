import type { Metadata } from "next";
import { Card, CardBody } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Section } from "@/components/ui/Section";
import { ContactForm } from "@/components/contact/ContactForm";
import { SITE } from "@/lib/content";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contactez Carthage-Clean : adresse, téléphone, email, horaires d'ouverture et formulaire de contact ou de signalement.",
};

function ContactRow({
  icon,
  title,
  value,
  href,
}: {
  icon: IconName;
  title: string;
  value: string;
  href?: string;
}) {
  const content = (
    <>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
        <Icon name={icon} size={20} />
      </span>
      <span>
        <span className="block text-xs font-medium uppercase tracking-wide text-slate-400">
          {title}
        </span>
        <span className="block text-sm font-medium text-slate-800">{value}</span>
      </span>
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        target={href.startsWith("http") ? "_blank" : undefined}
        rel={href.startsWith("http") ? "noreferrer" : undefined}
        className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-slate-50"
      >
        {content}
      </a>
    );
  }

  return <div className="flex items-center gap-3 p-2">{content}</div>;
}

export default function ContactPage() {
  return (
    <>
      <Section className="bg-brand-600 text-white">
        <Container>
          <h1 className="text-4xl font-bold">Contact</h1>
          <p className="mt-3 max-w-2xl text-brand-100">{SITE.contactIntro}</p>
        </Container>
      </Section>

      <Section>
        <Container className="grid gap-10 lg:grid-cols-3">
          {/* Colonne gauche : formulaire */}
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardBody>
                <h2 className="text-2xl font-bold text-slate-800">Écrivez-nous</h2>
                <p className="mt-2 text-slate-600">
                  Remplissez le formulaire ci-dessous. Les champs marqués d&apos;un astérisque sont
                  obligatoires.
                </p>
                <div className="mt-6">
                  <ContactForm />
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Colonne droite : coordonnées + carte */}
          <aside className="space-y-4">
            <Card>
              <CardBody className="divide-y divide-slate-100">
                <ContactRow icon="map" title="Adresse" value={SITE.address} href={SITE.mapUrl} />
                <ContactRow
                  icon="phone"
                  title="Téléphone"
                  value={SITE.phone}
                  href={`tel:${SITE.phone.replace(/\s/g, "")}`}
                />
                <ContactRow
                  icon="mail"
                  title="Email"
                  value={SITE.email}
                  href={`mailto:${SITE.email}`}
                />
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-800">
                  <Icon name="clock" size={18} className="text-brand-600" />
                  Horaires d&apos;ouverture
                </h3>
                <ul className="mt-4 space-y-2 text-sm text-slate-600">
                  {SITE.hours.map((slot) => (
                    <li key={slot.day} className="flex justify-between gap-4">
                      <span>{slot.day}</span>
                      <span className="font-medium text-slate-800">{slot.time}</span>
                    </li>
                  ))}
                </ul>
              </CardBody>
            </Card>

            <a
              href={SITE.mapUrl}
              target="_blank"
              rel="noreferrer"
              className="block overflow-hidden rounded-xl border border-slate-200 bg-brand-50 transition-colors hover:bg-brand-100"
              aria-label="Voir l'emplacement sur la carte"
            >
              <div className="relative flex h-44 flex-col items-center justify-center gap-2 text-brand-700">
                <Icon name="map" size={30} />
                <span className="text-sm font-medium">Voir sur la carte — Carthage, Tunisie</span>
                <span className="text-xs text-brand-500">Ouvrir dans Google Maps</span>
              </div>
            </a>
          </aside>
        </Container>
      </Section>
    </>
  );
}
