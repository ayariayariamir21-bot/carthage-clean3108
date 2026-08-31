import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { Section } from "@/components/ui/Section";
import { NEWS, SERVICES, SITE, STATS } from "@/lib/content";

export const metadata: Metadata = {
  description: SITE.description,
};

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-brand-600 text-white">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, rgba(16,185,129,0.45), transparent 45%), radial-gradient(circle at 80% 0%, rgba(94,132,172,0.5), transparent 40%)",
          }}
          aria-hidden="true"
        />
        <Container className="relative grid gap-10 py-20 md:grid-cols-2 md:py-28">
          <div className="flex flex-col justify-center">
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-brand-100">
              <Icon name="leaf" size={14} /> Service public de propreté
            </span>
            <h1 className="mt-4 text-4xl font-bold leading-tight md:text-5xl">{SITE.tagline}</h1>
            <p className="mt-4 max-w-xl text-brand-100">{SITE.description}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button href="/services" variant="secondary" size="lg">
                Découvrir nos services
              </Button>
              <Button
                href="/contact"
                size="lg"
                className="border border-white/40 bg-transparent text-white hover:bg-white/10"
              >
                Nous contacter
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 self-center">
            {STATS.map((stat) => (
              <Card key={stat.label} className="bg-white/10 text-white backdrop-blur">
                <CardBody>
                  <p className="text-3xl font-bold text-white">{stat.value}</p>
                  <p className="mt-1 text-sm text-brand-100">{stat.label}</p>
                </CardBody>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* Services preview */}
      <Section>
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-slate-800">Nos services</h2>
            <p className="mt-3 text-slate-600">
              Une offre complète pour garder Carthage propre, du centre historique aux quartiers
              littoraux.
            </p>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICES.slice(0, 3).map((service) => (
              <Card key={service.title} className="h-full">
                <CardBody>
                  <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                    <Icon name={service.icon} size={24} />
                  </span>
                  <h3 className="mt-4 text-lg font-semibold text-slate-800">{service.title}</h3>
                  <p className="mt-2 text-sm text-slate-600">{service.description}</p>
                </CardBody>
              </Card>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Button href="/services" variant="outline">
              Voir tous les services
            </Button>
          </div>
        </Container>
      </Section>

      {/* Newsletter / CTA */}
      <Section className="bg-slate-50">
        <Container>
          <Card className="bg-brand-600 text-white">
            <CardBody className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
              <div>
                <h2 className="text-2xl font-bold">
                  Un problème de propreté dans votre quartier ?
                </h2>
                <p className="mt-2 text-brand-100">
                  Signalez-le en quelques secondes, nos équipes prennent le relais.
                </p>
              </div>
              <Button href="/contact" variant="secondary" size="lg">
                Faire un signalement
              </Button>
            </CardBody>
          </Card>
        </Container>
      </Section>

      {/* Latest news */}
      <Section>
        <Container>
          <h2 className="text-3xl font-bold text-slate-800">Dernières actualités</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {NEWS.slice(0, 3).map((item) => (
              <Card key={item.title} className="h-full">
                <CardBody>
                  <p className="text-xs font-medium uppercase tracking-wide text-accent-600">
                    {item.date}
                  </p>
                  <h3 className="mt-2 text-lg font-semibold text-slate-800">{item.title}</h3>
                  <p className="mt-2 text-sm text-slate-600">{item.excerpt}</p>
                </CardBody>
              </Card>
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}
