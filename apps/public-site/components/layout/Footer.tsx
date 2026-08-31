import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { NAV_LINKS, SITE } from "@/lib/content";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-brand-600 text-brand-100">
      <Container className="grid gap-10 py-12 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2 font-bold text-white">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-sm font-bold text-white">
              CC
            </span>
            <span className="text-lg">{SITE.name}</span>
          </div>
          <p className="mt-3 text-sm text-brand-200">{SITE.description}</p>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-white">Navigation</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-brand-200 hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/mentions-legales" className="text-brand-200 hover:text-white">
                Mentions légales
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-white">Coordonnées</h3>
          <ul className="mt-3 space-y-2 text-sm text-brand-200">
            <li className="flex items-start gap-2">
              <Icon name="map" size={16} className="mt-0.5 shrink-0" />
              <span>{SITE.address}</span>
            </li>
            <li className="flex items-center gap-2">
              <Icon name="phone" size={16} className="shrink-0" />
              <a href={`tel:${SITE.phone.replace(/\s/g, "")}`} className="hover:text-white">
                {SITE.phone}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Icon name="mail" size={16} className="shrink-0" />
              <a href={`mailto:${SITE.email}`} className="hover:text-white">
                {SITE.email}
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-white">Suivez-nous</h3>
          <div className="mt-3 flex gap-3">
            {SITE.socials.map((social) => (
              <a
                key={social.name}
                href={social.href}
                aria-label={social.label}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
              >
                <Icon name={social.name} size={18} />
              </a>
            ))}
          </div>
          <p className="mt-4 text-xs text-brand-200">
            {SITE.legalName}
            <br />© {new Date().getFullYear()} — Tous droits réservés.
          </p>
        </div>
      </Container>
    </footer>
  );
}
