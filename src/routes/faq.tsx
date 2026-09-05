import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { PageShell } from "@/components/maideres/PageShell";
import { COMMISSION_GLOBALE_PCT } from "@/lib/maidere";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "Questions fréquentes — MAIDERES" },
      {
        name: "description",
        content:
          "Comment trouver un prestataire vérifié, comment sont fixés les prix en FCFA, quels délais d'intervention : les réponses aux questions fréquentes sur MAIDERES.",
      },
      { property: "og:title", content: "Questions fréquentes — MAIDERES" },
      {
        property: "og:description",
        content:
          "Clients et prestataires : tout ce qu'il faut savoir sur MAIDERES, de l'inscription au paiement.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Faq,
});

const questions = [
  {
    q: "Comment trouver un prestataire près de chez moi ?",
    r: "Décrivez votre besoin (service, ville, quartier, urgence) depuis l'espace client ou la page de recherche. Nous vous proposons des prestataires vérifiés proches de vous, classés par proximité, métier et note. Vous choisissez librement.",
  },
  {
    q: "Comment les prestataires sont-ils vérifiés ?",
    r: "Avant d'être publié, chaque prestataire passe par un contrôle d'identité, de savoir-faire et de références. Le badge « vérifié » apparaît sur sa fiche. Après chaque intervention, les clients laissent un avis qui alimente sa réputation.",
  },
  {
    q: "Quels sont les délais d'intervention ?",
    r: "Trois niveaux d'urgence : immédiate (prise en charge sous 2 h), rapide (sous 24 h) et planifiée (sous 72 h). Le délai exact est confirmé avec le prestataire dès la mise en relation.",
  },
  {
    q: "Comment sont fixés les prix ?",
    r: `Chaque offre affiche son prix en FCFA (au forfait, à l'heure ou à la journée selon le service). MAIDERES prélève une commission unique de ${COMMISSION_GLOBALE_PCT} % incluse dans le prix affiché — aucun frais caché.`,
  },
  {
    q: "Dans quelles villes MAIDERES est-il disponible ?",
    r: "Douala et Yaoundé au Cameroun (paiements en FCFA — XAF), et Abidjan en Côte d'Ivoire (FCFA — XOF). Le réseau s'étend quartier par quartier.",
  },
  {
    q: "Je suis prestataire : comment rejoindre le réseau ?",
    r: "Créez votre compte depuis le portail prestataire, complétez votre fiche (métier, zone, photos de réalisations) et publiez vos offres. L'inscription est gratuite ; la vérification de votre dossier est rapide.",
  },
  {
    q: "Que se passe-t-il en cas de litige ?",
    r: "Contactez-nous depuis la page Contact en précisant la référence de l'intervention. Notre équipe examine la situation avec le client et le prestataire, et s'appuie sur les avis et l'historique pour trancher.",
  },
  {
    q: "Puis-je laisser un avis après une intervention ?",
    r: "Oui, et c'est encouragé : chaque client peut noter l'intervention (1 à 5 étoiles) et laisser un commentaire. Le prestataire peut y répondre publiquement. Ces avis guident les futurs clients.",
  },
];

function Faq() {
  return (
    <PageShell
      titre="Questions fréquentes"
      accroche="Clients et prestataires : tout ce qu'il faut savoir pour utiliser MAIDERES en toute confiance."
    >
      <div className="space-y-4">
        {questions.map((item) => (
          <details
            key={item.q}
            className="group rounded-3xl border border-border bg-card p-6 open:border-secondary/40"
          >
            <summary className="cursor-pointer list-none font-bold text-primary group-open:text-secondary">
              {item.q}
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.r}</p>
          </details>
        ))}

        <div className="mt-10 rounded-3xl border border-border bg-muted/50 p-8 text-center">
          <h2 className="text-xl font-extrabold text-primary">Une autre question ?</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Notre équipe répond rapidement, en français.
          </p>
          <Link
            to="/contact"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-secondary px-6 py-3 text-sm font-bold text-secondary-foreground transition-transform hover:-translate-y-0.5"
          >
            Nous contacter <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </PageShell>
  );
}
