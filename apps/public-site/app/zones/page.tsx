import type { Metadata } from "next";
import { Badge } from "@/components/ui/Badge";
import { Card, CardBody } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Icon } from "@/components/ui/Icon";
import { ZONES } from "@/lib/content";

export const metadata: Metadata = {
  title: "Zones d'intervention",
  description:
    "Les quartiers couverts par Carthage-Clean : du centre historique de Carthage aux secteurs portuaires et littoraux.",
};

export default function ZonesPage() {
  return (
    <>
      <Section className="bg-brand-600 text-white">
        <Container>
          <h1 className="text-4xl font-bold">Zones d&apos;intervention</h1>
          <p className="mt-3 max-w-2xl text-brand-100">
            Six secteurs couverts, chacun avec un planning de tournées et des priorités adaptées à
            ses spécificités.
          </p>
        </Container>
      </Section>

      <Section>
        <Container>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {ZONES.map((zone) => (
              <Card key={zone.code} className="h-full">
                <CardBody>
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-slate-800">{zone.name}</h3>
                    <Badge tone="brand">{zone.code}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">{zone.description}</p>
                  <ul className="mt-4 space-y-2">
                    {zone.highlights.map((highlight) => (
                      <li
                        key={highlight}
                        className="flex items-center gap-2 text-sm text-slate-600"
                      >
                        <Icon name="map" size={16} className="text-accent-600" />
                        {highlight}
                      </li>
                    ))}
                  </ul>
                </CardBody>
              </Card>
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}
