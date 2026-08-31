import type { Metadata } from "next";
import { Card, CardBody } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { TEAM } from "@/lib/content";

export const metadata: Metadata = {
  title: "À propos",
  description:
    "Mission, vision et équipe de Carthage-Clean, la régie de propreté urbaine de la municipalité de Carthage.",
};

export default function AboutPage() {
  return (
    <>
      <Section className="bg-brand-600 text-white">
        <Container>
          <h1 className="text-4xl font-bold">À propos de Carthage-Clean</h1>
          <p className="mt-3 max-w-2xl text-brand-100">
            Une régie de service public au service du cadre de vie des habitants, des visiteurs et
            des entreprises de Carthage.
          </p>
        </Container>
      </Section>

      <Section>
        <Container className="grid gap-10 md:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Notre mission</h2>
            <p className="mt-3 text-slate-600">
              Garantir une collecte fiable des déchets, un nettoyage continu des espaces publics et
              un entretien soigné des espaces verts, dans le respect de l&apos;environnement et des
              habitants.
            </p>
            <h2 className="mt-8 text-2xl font-bold text-slate-800">Notre vision</h2>
            <p className="mt-3 text-slate-600">
              Faire de Carthage une commune de référence en matière de propreté urbaine et
              d&apos;économie circulaire, grâce à l&apos;innovation, au tri et à la participation
              citoyenne.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Notre histoire</h2>
            <p className="mt-3 text-slate-600">
              Créée pour unifier la gestion de la propreté sur l&apos;ensemble des quartiers, la
              régie a modernisé ses tournées, déployé le tri sélectif et renforcé la présence sur le
              terrain.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-4">
              <Card>
                <CardBody>
                  <p className="text-2xl font-bold text-brand-600">2018</p>
                  <p className="mt-1 text-sm text-slate-600">Création de la régie</p>
                </CardBody>
              </Card>
              <Card>
                <CardBody>
                  <p className="text-2xl font-bold text-brand-600">12</p>
                  <p className="mt-1 text-sm text-slate-600">Zones d&apos;intervention</p>
                </CardBody>
              </Card>
            </div>
          </div>
        </Container>
      </Section>

      <Section className="bg-slate-50">
        <Container>
          <h2 className="text-3xl font-bold text-slate-800">Notre équipe</h2>
          <p className="mt-3 max-w-2xl text-slate-600">
            Des femmes et des hommes engagés, du terrain à la coordination, pour une ville propre au
            quotidien.
          </p>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {TEAM.map((member) => (
              <Card key={member.name} className="h-full">
                <CardBody className="flex flex-col items-center text-center">
                  <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-xl font-bold text-brand-700">
                    {member.initials}
                  </span>
                  <h3 className="mt-4 font-semibold text-slate-800">{member.name}</h3>
                  <p className="mt-1 text-sm text-slate-500">{member.role}</p>
                </CardBody>
              </Card>
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}
