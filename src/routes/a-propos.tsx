import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, MapPin, ShieldCheck, Star } from "lucide-react";

import { PageShell } from "@/components/maideres/PageShell";
import { COMMISSION_GLOBALE_PCT } from "@/lib/maidere";

export const Route = createFileRoute("/a-propos")({
  head: () => ({
    meta: [
      { title: "À propos — MAIDERES" },
      {
        name: "description",
        content:
          "MAIDERES est la maison de référence et de services entre le Cameroun et la Côte d'Ivoire : prestataires vérifiés, prix clairs en FCFA, interventions rapides.",
      },
      { property: "og:title", content: "À propos — MAIDERES" },
      {
        property: "og:description",
        content:
          "Notre mission : rendre tous les services du quotidien accessibles près de chez vous, à Douala, Yaoundé et Abidjan.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: APropos,
});

const valeurs = [
  {
    icon: ShieldCheck,
    titre: "Confiance d'abord",
    texte:
      "Chaque prestataire est vérifié : identité, savoir-faire et références. Les avis après intervention maintiennent le niveau d'exigence.",
  },
  {
    icon: MapPin,
    titre: "Proximité réelle",
    texte:
      "Nous organisons le réseau quartier par quartier, de Bonapriso à Cocody, pour qu'un professionnel soit toujours proche de vous.",
  },
  {
    icon: Star,
    titre: "Transparence des prix",
    texte: `Prix affichés en FCFA, commission unique de ${COMMISSION_GLOBALE_PCT} %, aucun frais caché pour le client comme pour le prestataire.`,
  },
];

function APropos() {
  return (
    <PageShell
      titre="La maison de référence et de services"
      accroche="MAIDERES connecte particuliers, entreprises et organisations à des prestataires locaux vérifiés, entre le Cameroun et la Côte d'Ivoire."
    >
      <div className="space-y-12">
        <section>
          <h2 className="text-2xl font-extrabold tracking-tight text-primary">Notre mission</h2>
          <p className="mt-4 leading-relaxed text-foreground">
            Trouver un plombier fiable un dimanche soir, une couturière de confiance ou un
            transporteur sérieux ne devrait pas relever du bouche-à-oreille. MAIDERES est née de ce
            constat : à Douala, Yaoundé et Abidjan, les talents existent, mais la mise en relation
            reste difficile.
          </p>
          <p className="mt-4 leading-relaxed text-foreground">
            Notre plateforme rassemble des prestataires vérifiés dans huit catégories — plomberie,
            bricolage et rénovation, restauration, hébergement, shopping, transport, immobilier et
            couture — et les met en relation avec des clients de leur quartier, avec des prix clairs
            en FCFA et un engagement de délai selon l'urgence.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-extrabold tracking-tight text-primary">Nos valeurs</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-3">
            {valeurs.map((v) => (
              <div key={v.titre} className="rounded-3xl border border-border bg-card p-6">
                <v.icon className="h-6 w-6 text-secondary" />
                <h3 className="mt-4 font-bold text-primary">{v.titre}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{v.texte}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-extrabold tracking-tight text-primary">Où nous trouver</h2>
          <p className="mt-4 leading-relaxed text-foreground">
            MAIDERES opère aujourd'hui dans trois métropoles d'Afrique centrale et de l'Ouest :
            <strong> Douala</strong> et <strong>Yaoundé</strong> au Cameroun (paiements en FCFA —
            XAF), et <strong>Abidjan</strong> en Côte d'Ivoire (FCFA — XOF). Notre réseau grandit
            quartier par quartier.
          </p>
        </section>

        <section
          className="rounded-3xl p-8 text-primary-foreground"
          style={{ background: "var(--gradient-deep)" }}
        >
          <h2 className="text-2xl font-extrabold">Envie de nous rejoindre ?</h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-primary-foreground/80">
            Vous êtes un professionnel du service ? Créez votre fiche prestataire et recevez des
            demandes qualifiées près de chez vous.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/auth/prestataire"
              className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-bold text-accent-foreground transition-transform hover:-translate-y-0.5"
            >
              Devenir prestataire <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/prestataires"
              className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/30 px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-foreground/10"
            >
              Voir les prestataires
            </Link>
          </div>
        </section>
      </div>
    </PageShell>
  );
}
