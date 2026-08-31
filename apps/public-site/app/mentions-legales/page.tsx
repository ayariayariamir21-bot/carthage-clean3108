import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SITE } from "@/lib/content";

export const metadata: Metadata = {
  title: "Mentions légales",
  description: "Mentions légales et informations légales de Carthage-Clean.",
};

export default function LegalPage() {
  return (
    <Section>
      <Container className="max-w-3xl">
        <h1 className="text-3xl font-bold text-slate-800">Mentions légales</h1>

        <div className="mt-8 space-y-6 text-sm leading-relaxed text-slate-600">
          <section>
            <h2 className="text-lg font-semibold text-slate-800">Éditeur du site</h2>
            <p className="mt-2">
              Le présent site est édité par la {SITE.legalName} ({SITE.name}), dont le siège social
              est situé {SITE.address}.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-800">Contact</h2>
            <p className="mt-2">
              Téléphone : {SITE.phone}
              <br />
              Email : {SITE.email}
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-800">Directeur de la publication</h2>
            <p className="mt-2">
              Le directeur de la publication est le représentant légal de la {SITE.legalName}.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-800">Hébergement</h2>
            <p className="mt-2">
              Le site est hébergé sur une infrastructure conforme aux bonnes pratiques du secteur
              public. Les données sont traitées dans le respect de la législation en vigueur.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-800">
              Propriété intellectuelle et données
            </h2>
            <p className="mt-2">
              L&apos;ensemble des contenus (textes, illustrations, logotype) est fourni à titre
              indicatif. Les informations transmises via le formulaire de contact sont utilisées
              uniquement pour traiter votre demande et ne sont pas cédées à des tiers.
            </p>
          </section>
        </div>
      </Container>
    </Section>
  );
}
