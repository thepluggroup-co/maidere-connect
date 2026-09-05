import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";

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

import logo from "@/assets/maideres-logo.asset.json";
import heroImage from "@/assets/hero-maidere.jpg";
import {
  URGENCES,
  VILLES,
  quartiersParVille,
  classerPrestataires,
  delaiCible,
  resteAvantDelai,
  reversement,
  xof,
  COMMISSION_GLOBALE_PCT,
  type NiveauUrgence,
  type Prestataire,
  type Ville,
} from "@/lib/maidere";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MAIDERES — Tous les services près de chez vous" },
      {
        name: "description",
        content:
          "MAIDERES connecte particuliers et entreprises à des prestataires vérifiés à Douala, Yaoundé et Abidjan : plomberie, bricolage, restauration, transport et plus.",
      },
      { property: "og:title", content: "MAIDERES — Tous les services près de chez vous" },
      {
        property: "og:description",
        content:
          "Trouvez un prestataire vérifié près de chez vous à Douala, Yaoundé ou Abidjan. Interventions rapides, prix clairs en FCFA, avis de confiance.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});


const services = [
  { name: "Plomberie", icon: Droplets, tint: "bg-brand-indigo" },
  { name: "Bricolage & Rénovation", icon: Hammer, tint: "bg-secondary" },
  { name: "Restauration", icon: UtensilsCrossed, tint: "bg-brand-magenta" },
  { name: "Hébergement", icon: BedDouble, tint: "bg-brand-magenta" },
  { name: "Shopping", icon: ShoppingCart, tint: "bg-brand-indigo" },
  { name: "Transport", icon: Car, tint: "bg-brand-indigo" },
  { name: "Immobilier", icon: Building2, tint: "bg-primary" },
  { name: "Couture", icon: Scissors, tint: "bg-brand-magenta" },
];

const trust = [
  {
    icon: ShieldCheck,
    title: "Prestataires vérifiés",
    text: "Identité, savoir-faire et références contrôlés avant chaque mise en relation.",
  },
  {
    icon: MapPin,
    title: "Douala · Yaoundé · Abidjan",
    text: "Un réseau de proximité, quartier par quartier, entre le Cameroun et la Côte d'Ivoire.",
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
      "Fuite d'eau un dimanche soir à Bonapriso. Un plombier vérifié était chez moi en 40 minutes.",
    name: "Aïcha N.",
    role: "Cliente, Douala",
  },
  {
    quote:
      "Depuis MAIDERES, mon atelier de couture ne manque plus de commandes. Les paiements sont clairs.",
    name: "Estelle M.",
    role: "Prestataire couture, Yaoundé",
  },
  {
    quote:
      "Nous gérons la maintenance de 12 agences avec MAIDERES. Délais respectés, factures nettes.",
    name: "Serge A.",
    role: "Responsable services généraux, Abidjan",
  },
];

const demoPrestataires: Prestataire[] = [
  {
    id: "1",
    nom: "Ekwalla J.",
    metier: "Plombier",
    categorieId: "plomberie",
    statut: "actif",
    disponible: true,
    quartier: "Bonapriso",
    zonesCouverture: ["Bonapriso", "Akwa", "Bonanjo"],
    note: 4.8,
  },
  {
    id: "2",
    nom: "Njoya A.",
    metier: "Plombier",
    categorieId: "plomberie",
    statut: "verifie",
    disponible: true,
    quartier: "Makepe",
    zonesCouverture: ["Makepe", "Bonamoussadi", "Bepanda"],
    note: 4.5,
  },
  {
    id: "3",
    nom: "Mballa S.",
    metier: "Bricoleur",
    categorieId: "bricolage",
    statut: "actif",
    disponible: true,
    quartier: "Bastos",
    zonesCouverture: ["Bastos", "Nlongkak", "Essos"],
    note: 4.2,
  },
  {
    id: "4",
    nom: "Estelle M.",
    metier: "Couturière",
    categorieId: "couture",
    statut: "actif",
    disponible: true,
    quartier: "Biyem_Assi",
    zonesCouverture: ["Biyem-Assi", "Nsimeyong"],
    note: 4.9,
  },
  {
    id: "5",
    nom: "Konan B.",
    metier: "Plombier",
    categorieId: "plomberie",
    statut: "actif",
    disponible: true,
    quartier: "Cocody",
    zonesCouverture: ["Cocody", "Riviera", "Plateau"],
    note: 4.7,
  },
  {
    id: "6",
    nom: "Fatou S.",
    metier: "Couturière",
    categorieId: "couture",
    statut: "verifie",
    disponible: true,
    quartier: "Adjamé",
    zonesCouverture: ["Adjamé", "Plateau"],
    note: 4.6,
  },
  {
    id: "7",
    nom: "Yao K.",
    metier: "Polyvalent",
    categorieId: null,
    statut: "verifie",
    disponible: true,
    quartier: "Yopougon",
    zonesCouverture: ["Yopougon", "Attécoubé"],
    note: 3.9,
  },
];

const categoriesDemo = [
  { id: "plomberie", label: "Plomberie" },
  { id: "bricolage", label: "Bricolage" },
  { id: "couture", label: "Couture" },
];

function MatchingDemo() {
  const [categorieId, setCategorieId] = useState("plomberie");
  const [ville, setVille] = useState<Ville>("Douala");
  const [quartier, setQuartier] = useState("Bonapriso");
  const [urgence, setUrgence] = useState<NiveauUrgence>("immediate");

  const quartiers = useMemo(() => quartiersParVille(ville), [ville]);

  const resultats = useMemo(
    () => classerPrestataires({ categorieId, quartier }, demoPrestataires).slice(0, 3),
    [categorieId, quartier],
  );

  const [maintenant, setMaintenant] = useState<Date | null>(null);
  useEffect(() => setMaintenant(new Date()), []);

  const cible = useMemo(
    () => (maintenant ? delaiCible(maintenant, urgence) : null),
    [maintenant, urgence],
  );


  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <div className="rounded-3xl border border-border bg-card p-6">
        <div className="space-y-4">
          <label className="block text-sm font-semibold text-primary">
            Service
            <select
              value={categorieId}
              onChange={(e) => setCategorieId(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-input bg-background px-4 py-2.5 text-sm font-normal text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {categoriesDemo.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-semibold text-primary">
            Ville
            <select
              value={ville}
              onChange={(e) => {
                const v = e.target.value as Ville;
                setVille(v);
                setQuartier(quartiersParVille(v)[0] ?? "");
              }}
              className="mt-2 w-full rounded-2xl border border-input bg-background px-4 py-2.5 text-sm font-normal text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {VILLES.map((v) => (
                <option key={v.nom} value={v.nom}>
                  {v.nom} — {v.pays} ({v.devise})
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-semibold text-primary">
            Quartier
            <select
              value={quartier}
              onChange={(e) => setQuartier(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-input bg-background px-4 py-2.5 text-sm font-normal text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {quartiers.map((q) => (
                <option key={q} value={q}>
                  {q}
                </option>
              ))}
            </select>
          </label>

          <fieldset>
            <legend className="text-sm font-semibold text-primary">Urgence</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {(Object.keys(URGENCES) as NiveauUrgence[]).map((u) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => setUrgence(u)}
                  className={`rounded-full px-4 py-2 text-xs font-bold transition-colors ${
                    urgence === u
                      ? "bg-primary text-primary-foreground"
                      : "border border-border bg-background text-muted-foreground hover:text-primary"
                  }`}
                >
                  {URGENCES[u].libelle}
                </button>
              ))}
            </div>
          </fieldset>
          <p className="rounded-2xl bg-muted/70 px-4 py-3 text-xs text-muted-foreground">
            Engagement de prise en charge :{" "}
            <span className={`font-bold ${URGENCES[urgence].ton}`}>
              {URGENCES[urgence].delaiHeures} h
            </span>{" "}
            — échéance {resteAvantDelai(cible)}.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {resultats.length === 0 && (
          <p className="rounded-3xl border border-border bg-card p-6 text-sm text-muted-foreground">
            Aucun prestataire disponible sur ce croisement pour l'instant.
          </p>
        )}
        {resultats.map((p, i) => (
          <div
            key={p.id}
            className="flex items-center gap-4 rounded-3xl border border-border bg-card p-5"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-sm font-extrabold text-primary-foreground">
              {i + 1}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-primary">
                {p.nom} · <span className="font-medium text-muted-foreground">{p.metier}</span>
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{p.raisons.join(" · ")}</p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-xl font-extrabold text-secondary">{p.score}</p>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">score</p>
            </div>
          </div>
        ))}
        <p className="px-2 text-xs text-muted-foreground">
          Classement indicatif : proximité, métier, zone couverte et note. Le choix final vous
          revient.
        </p>
      </div>
    </div>
  );
}

function CommissionDemo() {
  const [montant, setMontant] = useState(25000);
  const { montantCommission, montantPrestataire } = reversement(montant);

  return (
    <div className="rounded-3xl border border-border bg-card p-6 lg:p-8">
      <label className="block text-sm font-semibold text-primary" htmlFor="montant">
        Montant de l'intervention
      </label>
      <input
        id="montant"
        type="range"
        min={5000}
        max={500000}
        step={5000}
        value={montant}
        onChange={(e) => setMontant(Number(e.target.value))}
        className="mt-4 w-full accent-[oklch(0.494_0.181_344)]"
      />
      <p className="mt-3 text-3xl font-extrabold text-primary">{xof(montant)}</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl bg-secondary/10 p-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-secondary">
            Reversé au prestataire
          </p>
          <p className="mt-1 text-xl font-extrabold text-primary">{xof(montantPrestataire)}</p>
        </div>
        <div className="rounded-2xl bg-muted p-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Commission MAIDERES ({COMMISSION_GLOBALE_PCT} %)
          </p>
          <p className="mt-1 text-xl font-extrabold text-primary">{xof(montantCommission)}</p>
        </div>
      </div>
    </div>
  );
}



function Landing() {
  return (
    <div className="min-h-screen font-sans">
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur">
        <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-3">
          <a href="#top" className="flex min-w-0 items-center gap-3">
            <img
              src={logo.url}
              alt="Logo MAIDERES"
              width={44}
              height={44}
              className="h-11 w-11 shrink-0 rounded-xl bg-card object-contain p-0.5"
            />
            <span className="min-w-0">
              <span className="block truncate text-lg font-extrabold tracking-tight text-primary">
                MAIDERES
              </span>
              <span className="hidden text-xs text-muted-foreground sm:block">
                Tous les services près de chez vous
              </span>
            </span>
          </a>
          <nav className="flex items-center gap-4">
            <Link
              to="/prestataires"
              className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-primary md:block"
            >
              Prestataires
            </Link>
            <Link
              to="/auth/client"
              className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-primary md:block"
            >
              Espace client
            </Link>
            <Link
              to="/auth/prestataire"
              className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-primary md:block"
            >
              Espace prestataire
            </Link>
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
                <MapPin className="h-3.5 w-3.5" /> Douala · Yaoundé · Abidjan
              </span>
              <h1 className="mt-5 font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
                Tous les services
                <br />
                <span className="text-accent">près de chez vous</span>
              </h1>
              <p className="mt-5 max-w-lg text-base leading-relaxed text-primary-foreground/80 sm:text-lg">
                MAIDERES met en relation particuliers, entreprises et organisations avec des
                prestataires locaux vérifiés, au Cameroun et en Côte d'Ivoire. Une urgence ? Un
                professionnel intervient rapidement, au juste prix en FCFA.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="#inscription"
                  className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-bold text-accent-foreground transition-transform hover:-translate-y-0.5"
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
                    <dt className="text-2xl font-extrabold text-primary-foreground">{v}</dt>
                    <dd className="text-xs text-primary-foreground/70">{l}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="relative">
              <img
                src={heroImage}
                alt="Prestataires MAIDERES : plombier et couturière au travail"
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
                Du dépannage à la commande du quotidien, MAIDERES couvre les besoins des foyers
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

        {/* Matching & SLA */}
        <section id="matching" className="bg-muted/60 py-16 lg:py-24">
          <div className="mx-auto max-w-6xl px-5">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-widest text-secondary">
                Mise en relation
              </p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-primary sm:text-4xl">
                Le bon prestataire, choisi sur des critères clairs
              </h2>
              <p className="mt-3 text-muted-foreground">
                Proximité réelle (distance entre quartiers), métier, zone couverte et note client.
                Essayez la simulation ci-dessous.
              </p>
            </div>
            <div className="mt-10">
              <MatchingDemo />
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {(Object.keys(URGENCES) as NiveauUrgence[]).map((u) => (
                <div key={u} className="rounded-3xl border border-border bg-card p-5">
                  <p className={`text-sm font-bold ${URGENCES[u].ton}`}>{URGENCES[u].libelle}</p>
                  <p className="mt-1 text-2xl font-extrabold text-primary">
                    {URGENCES[u].delaiHeures} h
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Délai cible de prise en charge
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Commission */}
        <section id="commission" className="mx-auto max-w-6xl px-5 py-16 lg:py-24">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-secondary">
                Tarification
              </p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-primary sm:text-4xl">
                Une commission unique de {COMMISSION_GLOBALE_PCT} %
              </h2>
              <p className="mt-3 text-muted-foreground">
                Pas de frais cachés : le prestataire connaît son reversement dès l'accord, en FCFA.
                Des règles spécifiques peuvent s'appliquer par catégorie ou par prestataire
                partenaire.
              </p>
            </div>
            <CommissionDemo />
          </div>
        </section>


        {/* Testimonials */}
        <section className="bg-muted/60 py-16 lg:py-24">
          <div className="mx-auto max-w-6xl px-5">
            <h2 className="max-w-xl text-3xl font-extrabold tracking-tight text-primary sm:text-4xl">
              Ils utilisent MAIDERES au quotidien
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
                  placeholder="Votre numéro (ex : 6 XX XX XX XX)"
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
                Rejoignez le réseau MAIDERES : des demandes qualifiées près de votre quartier, une
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
                href="mailto:contact@maideres.com"
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
                alt="Logo MAIDERES"
                width={40}
                height={40}
                loading="lazy"
                className="h-10 w-10 rounded-xl bg-card object-contain p-0.5"
              />
              <span className="text-lg font-extrabold">MAIDERES</span>
            </div>
            <p className="mt-4 max-w-sm text-sm text-primary-foreground/70">
              Maison de référence et de services. Prestataires vérifiés à Douala, Yaoundé et
              Abidjan. Paiements en FCFA (XAF / XOF).
            </p>
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-primary-foreground/90">
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
            <h3 className="text-sm font-bold uppercase tracking-widest text-primary-foreground/90">
              Contact
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-primary-foreground/70">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0" /> +237 6 00 00 00 00
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0" /> contact@maideres.com
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0" /> Douala · Yaoundé · Abidjan
              </li>
            </ul>
          </div>

        </div>
        <div className="border-t border-primary-foreground/15 px-5 py-5 text-center text-xs text-primary-foreground/60">
          © {new Date().getFullYear()} MAIDERES — Tous les services près de chez vous.
        </div>
      </footer>
    </div>
  );
}
