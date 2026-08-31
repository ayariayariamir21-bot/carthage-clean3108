import type { Metadata } from "next";
import { Card, CardBody } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { Section } from "@/components/ui/Section";
import { SERVICES } from "@/lib/content";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Collecte des déchets, nettoyage des rues, gestion des espaces verts, enlèvement des encombrants et signalement citoyen à Carthage.",
};

export default function ServicesPage() {
  return (
    <>
      <Section className="bg-brand-600 text-white">
        <Container>
          <h1 className="text-4xl font-bold">Nos services</h1>
          <p className="mt-3 max-w-2xl text-brand-100">
            Une offre de propreté urbaine pensée pour chaque quartier, du centre historique aux
            rives de la corniche.
          </p>
        </Container>
      </Section>

      <Section>
        <Container>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((service) => (
              <Card key={service.title} className="h-full">
                <CardBody>
                  <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent-50 text-accent-600">
                    <Icon name={service.icon} size={24} />
                  </span>
                  <h3 className="mt-4 text-lg font-semibold text-slate-800">{service.title}</h3>
                  <p className="mt-2 text-sm text-slate-600">{service.description}</p>
                </CardBody>
              </Card>
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}
