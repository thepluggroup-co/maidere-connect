import { createFileRoute } from "@tanstack/react-router";
import {
  Droplets,
  Hammer,
  UtensilsCrossed,
  BedDouble,
  ShoppingCart,
  Car,
  Building2,
  Scissors,
  ShieldCheck,
  MapPin,
  Star,
  Search,
  UserCheck,
  Sparkles,
  ArrowRight,
  Phone,
  Mail,
} from "lucide-react";

import logo from "@/assets/maidere-logo.asset.json";
import heroImage from "@/assets/hero-maidere.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MAIDERE — Tous les services près de chez vous" },
      {
        name: "description",
        content:
          "MAIDERE connecte particuliers et entreprises à des prestataires vérifiés partout en Côte d'Ivoire : plomberie, bricolage, restauration, transport et plus.",
      },
      { property: "og:title", content: "MAIDERE — Tous les services près de chez vous" },
      {
        property: "og:description",
        content:
          "Trouvez un prestataire vérifié près de chez vous en Côte d'Ivoire. Interventions rapides, prix clairs en FCFA, avis de confiance.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const services = [
  { name: "Plomberie", icon: Droplets, tint: "bg-brand-sky" },
  { name: "Bricolage & Rénovation", icon: Hammer, tint: "bg-secondary" },
  { name: "Restauration", icon: UtensilsCrossed, tint: "bg-brand-orange" },
  { name: "Hébergement", icon: BedDouble, tint: "bg-brand-pink" },
  { name: "Shopping", icon: ShoppingCart, tint: "bg-brand-violet" },
  { name: "Transport", icon: Car, tint: "bg-brand-sky" },
  { name: "Immobilier", icon: Building2, tint: "bg-primary" },
  { name: "Couture", icon: Scissors, tint: "bg-brand-orange" },
];

const trust = [
  {
    icon: ShieldCheck,
    title: "Prestataires vérifiés",
    text: "Identité, savoir-faire et références contrôlés avant chaque mise en relation.",
  },
  {
    icon: MapPin,
    title: "Partout en Côte d'Ivoire",
    text: "Abidjan, Bouaké, Yamoussoukro, San-Pédro… un réseau de proximité, ville par ville.",
  },
  {
    icon: Star,
    title: "Avis de confiance",
    text: "Chaque intervention est notée. Les évaluations réelles guident votre choix.",
  },
];

const steps = [
  {
    n: "01",
    icon: Search,
    title: "Décrivez votre besoin",
    text: "Un service, un quartier, une urgence. En moins d'une minute.",
  },
  {
    n: "02",
    icon: UserCheck,
    title: "Recevez des prestataires",
    text: "Nous vous proposons des professionnels vérifiés proches de vous, avec leurs notes.",
  },
  {
    n: "03",
    icon: Sparkles,
    title: "Intervention & paiement",
    text: "Le prestataire intervient, vous payez en FCFA. Notre commission est transparente.",
  },
];

const testimonials = [
  {
    quote:
      "Fuite d'eau un dimanche soir à Cocody. Un plombier vérifié était chez moi en 40 minutes.",
    name: "Aïcha K.",
    role: "Cliente, Abidjan",
  },
  {
    quote:
      "Depuis MAIDERE, mon atelier de couture ne manque plus de commandes. Les paiements sont clairs.",
    name: "Bakary T.",
    role: "Prestataire couture, Yopougon",
  },
  {
    quote:
      "Nous gérons la maintenance de 12 agences avec MAIDERE. Délais respectés, factures nettes.",
    name: "Serge A.",
    role: "Responsable services généraux",
  },
];

function Landing() {
  return (
    <div className="min-h-screen font-sans">
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur">
        <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-3">
          <a href="#top" className="flex min-w-0 items-center gap-3">
            <img
              src={logo.url}
              alt="Logo MAIDERE"
              width={44}
              height={44}
              className="h-11 w-11 shrink-0 rounded-xl object-cover object-top"
            />
            <span className="min-w-0">
              <span className="block truncate text-lg font-extrabold tracking-tight text-primary">
                MAIDERE
              </span>
              <span className="hidden text-xs text-muted-foreground sm:block">
                Tous les services près de chez vous
              </span>
            </span>
          </a>
          <nav className="flex items-center gap-6">
            <a
              href="#services"
              className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-primary md:block"
            >
              Services
            </a>
            <a
              href="#fonctionnement"
              className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-primary md:block"
            >
              Comment ça marche
            </a>
            <a
              href="#inscription"
              className="inline-flex shrink-0 items-center gap-2 rounded-full bg-secondary px-4 py-2 text-sm font-semibold text-secondary-foreground shadow-[var(--shadow-glow)] transition-transform hover:-translate-y-0.5"
            >
              Trouver un prestataire
            </a>
          </nav>
        </div>
      </header>

      <main id="top">
        {/* Hero */}
        <section className="relative overflow-hidden" style={{ background: "var(--gradient-deep)" }}>
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-secondary/25 blur-3xl" />
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-16 lg:grid-cols-2 lg:py-24">
            <div className="text-primary-foreground">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest">
                <MapPin className="h-3.5 w-3.5" /> Côte d'Ivoire
              </span>
              <h1 className="mt-5 text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
                Tous les services
                <br />
                <span className="text-secondary">près de chez vous</span>
              </h1>
              <p className="mt-5 max-w-lg text-base leading-relaxed text-primary-foreground/80 sm:text-lg">
                MAIDERE met en relation particuliers, entreprises et organisations avec des
                prestataires locaux vérifiés. Une urgence ? Un professionnel intervient
                rapidement, au juste prix en FCFA.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="#inscription"
                  className="inline-flex items-center gap-2 rounded-full bg-secondary px-6 py-3 text-sm font-bold text-secondary-foreground shadow-[var(--shadow-glow)] transition-transform hover:-translate-y-0.5"
                >
                  Trouver un prestataire <ArrowRight className="h-4 w-4" />
                </a>
                <a
                  href="#prestataires"
                  className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/30 px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-foreground/10"
                >
                  Devenir prestataire
                </a>
              </div>
              <dl className="mt-10 grid max-w-md grid-cols-3 gap-4 border-t border-primary-foreground/15 pt-6">
                {[
                  ["8", "catégories"],
                  ["100%", "profils vérifiés"],
                  ["24/7", "demandes urgentes"],
                ].map(([v, l]) => (
                  <div key={l}>
                    <dt className="text-2xl font-extrabold text-secondary">{v}</dt>
                    <dd className="text-xs text-primary-foreground/70">{l}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="relative">
              <img
                src={heroImage}
                alt="Prestataires MAIDERE : plombier et couturière au travail"
                width={1408}
                height={1104}
                className="w-full rounded-3xl object-cover shadow-[var(--shadow-card)]"
              />
              <div className="absolute -bottom-5 left-4 flex items-center gap-3 rounded-2xl bg-card px-4 py-3 shadow-[var(--shadow-card)]">
                <ShieldCheck className="h-8 w-8 shrink-0 text-secondary" />
                <div className="min-w-0">
                  <p className="text-sm font-bold text-primary">Prestataire vérifié</p>
                  <p className="text-xs text-muted-foreground">Note moyenne 4,8 / 5</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trust */}
        <section className="mx-auto max-w-6xl px-5 py-16 lg:py-20">
          <div className="grid gap-5 md:grid-cols-3">
            {trust.map(({ icon: Icon, title, text }) => (
              <div
                key={title}
                className="rounded-3xl border border-border bg-card p-6 transition-shadow hover:shadow-[var(--shadow-card)]"
              >
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary/12 text-secondary">
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="mt-4 text-lg font-bold text-primary">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Services */}
        <section id="services" className="bg-muted/60 py-16 lg:py-24">
          <div className="mx-auto max-w-6xl px-5">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-widest text-secondary">
                Nos services
              </p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-primary sm:text-4xl">
                Huit familles de services, un seul point d'entrée
              </h2>
              <p className="mt-3 text-muted-foreground">
                Du dépannage à la commande du quotidien, MAIDERE couvre les besoins des foyers
                et des entreprises.
              </p>
            </div>
            <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {services.map(({ name, icon: Icon, tint }) => (
                <a
                  key={name}
                  href="#inscription"
                  className="group rounded-3xl border border-border bg-card p-5 transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-card)]"
                >
                  <span
                    className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${tint} text-primary-foreground`}
                  >
                    <Icon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-4 text-sm font-bold leading-snug text-primary">{name}</h3>
                  <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-secondary opacity-0 transition-opacity group-hover:opacity-100">
                    Réserver <ArrowRight className="h-3 w-3" />
                  </span>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="fonctionnement" className="mx-auto max-w-6xl px-5 py-16 lg:py-24">
          <h2 className="max-w-xl text-3xl font-extrabold tracking-tight text-primary sm:text-4xl">
            Comment ça marche
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {steps.map(({ n, icon: Icon, title, text }) => (
              <div key={n} className="relative rounded-3xl bg-card p-6 shadow-[var(--shadow-card)]">
                <span className="text-4xl font-extrabold text-secondary/25">{n}</span>
                <Icon className="mt-2 h-7 w-7 text-primary" />
                <h3 className="mt-3 text-lg font-bold text-primary">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section className="bg-muted/60 py-16 lg:py-24">
          <div className="mx-auto max-w-6xl px-5">
            <h2 className="max-w-xl text-3xl font-extrabold tracking-tight text-primary sm:text-4xl">
              Ils utilisent MAIDERE au quotidien
            </h2>
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {testimonials.map((t) => (
                <blockquote
                  key={t.name}
                  className="flex h-full flex-col justify-between rounded-3xl border border-border bg-card p-6"
                >
                  <div className="flex gap-1 text-secondary">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-foreground">« {t.quote} »</p>
                  <footer className="mt-5 text-xs">
                    <span className="block font-bold text-primary">{t.name}</span>
                    <span className="text-muted-foreground">{t.role}</span>
                  </footer>
                </blockquote>
              ))}
            </div>
          </div>
        </section>

        {/* Dual CTA */}
        <section id="inscription" className="mx-auto max-w-6xl px-5 py-16 lg:py-24">
          <div className="grid gap-5 lg:grid-cols-2">
            <div
              className="rounded-3xl p-8 text-primary-foreground lg:p-10"
              style={{ background: "var(--gradient-deep)" }}
            >
              <h2 className="text-2xl font-extrabold sm:text-3xl">J'ai besoin d'un service</h2>
              <p className="mt-3 text-sm leading-relaxed text-primary-foreground/80">
                Décrivez votre besoin, recevez des prestataires vérifiés près de vous et suivez
                l'intervention jusqu'au paiement.
              </p>
              <form
                className="mt-6 flex flex-col gap-3 sm:flex-row"
                onSubmit={(e) => e.preventDefault()}
              >
                <input
                  type="tel"
                  required
                  placeholder="Votre numéro (ex : 07 00 00 00 00)"
                  aria-label="Votre numéro de téléphone"
                  className="min-w-0 flex-1 rounded-full border border-primary-foreground/25 bg-primary-foreground/10 px-5 py-3 text-sm text-primary-foreground placeholder:text-primary-foreground/50 focus:outline-none focus:ring-2 focus:ring-secondary"
                />
                <button
                  type="submit"
                  className="shrink-0 rounded-full bg-secondary px-6 py-3 text-sm font-bold text-secondary-foreground transition-transform hover:-translate-y-0.5"
                >
                  Être rappelé
                </button>
              </form>
            </div>
            <div
              id="prestataires"
              className="rounded-3xl border border-border bg-card p-8 lg:p-10"
            >
              <h2 className="text-2xl font-extrabold text-primary sm:text-3xl">
                Je suis prestataire
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Rejoignez le réseau MAIDERE : des demandes qualifiées près de votre quartier, une
                commission claire et des paiements suivis en FCFA.
              </p>
              <ul className="mt-5 space-y-2 text-sm text-foreground">
                {[
                  "Inscription gratuite et vérification rapide",
                  "Missions urgentes dans votre zone",
                  "Reversements suivis, sans mauvaise surprise",
                ].map((i) => (
                  <li key={i} className="flex items-start gap-2">
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-secondary" />
                    {i}
                  </li>
                ))}
              </ul>
              <a
                href="mailto:contact@maidere.ci"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground transition-transform hover:-translate-y-0.5"
              >
                Déposer ma candidature <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-primary text-primary-foreground">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-3">
              <img
                src={logo.url}
                alt="Logo MAIDERE"
                width={40}
                height={40}
                loading="lazy"
                className="h-10 w-10 rounded-xl object-cover object-top"
              />
              <span className="text-lg font-extrabold">MAIDERE</span>
            </div>
            <p className="mt-4 max-w-sm text-sm text-primary-foreground/70">
              Maison de référence et de services. Prestataires vérifiés, partout en Côte
              d'Ivoire. Paiements en FCFA (XOF).
            </p>
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-secondary">
              Services
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-primary-foreground/70">
              {services.slice(0, 5).map((s) => (
                <li key={s.name}>
                  <a href="#services" className="hover:text-primary-foreground">
                    {s.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-secondary">
              Contact
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-primary-foreground/70">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0" /> +225 07 00 00 00 00
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0" /> contact@maidere.ci
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0" /> Abidjan, Côte d'Ivoire
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-primary-foreground/15 px-5 py-5 text-center text-xs text-primary-foreground/60">
          © {new Date().getFullYear()} MAIDERE — Tous les services près de chez vous.
        </div>
      </footer>
    </div>
  );
}
