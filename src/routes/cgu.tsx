import { createFileRoute } from "@tanstack/react-router";

import { PageShell } from "@/components/maideres/PageShell";
import { COMMISSION_GLOBALE_PCT } from "@/lib/maidere";

export const Route = createFileRoute("/cgu")({
  head: () => ({
    meta: [
      { title: "Conditions générales d'utilisation — MAIDERES" },
      {
        name: "description",
        content:
          "Conditions générales d'utilisation de la plateforme MAIDERES : rôles client et prestataire, commission, avis, responsabilités.",
      },
      { property: "og:title", content: "Conditions générales d'utilisation — MAIDERES" },
      {
        property: "og:description",
        content:
          "Les règles qui encadrent l'utilisation de MAIDERES par les clients et les prestataires.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Cgu,
});

const articles = [
  {
    titre: "1. Objet",
    texte:
      "MAIDERES est une plateforme de mise en relation entre des clients (particuliers, entreprises, organisations) et des prestataires de services indépendants, opérant à Douala et Yaoundé (Cameroun) et à Abidjan (Côte d'Ivoire). Les présentes conditions régissent l'accès et l'utilisation de la plateforme.",
  },
  {
    titre: "2. Comptes et rôles",
    texte:
      "Deux types de comptes existent : client et prestataire. Toute information fournie à l'inscription doit être exacte et à jour. Le compte est personnel et ne peut être cédé. MAIDERES se réserve le droit de suspendre un compte en cas d'informations fausses ou d'usage abusif.",
  },
  {
    titre: "3. Vérification des prestataires",
    texte:
      "Les prestataires font l'objet d'un contrôle d'identité, de savoir-faire et de références avant publication. Le badge « vérifié » atteste de ce contrôle au moment de l'inscription ; il ne constitue pas une garantie de résultat pour chaque intervention.",
  },
  {
    titre: "4. Offres, prix et commission",
    texte: `Les prestataires publient leurs offres avec un prix en FCFA (XAF au Cameroun, XOF en Côte d'Ivoire). MAIDERES perçoit une commission de ${COMMISSION_GLOBALE_PCT} % sur les interventions réalisées via la plateforme, incluse dans le prix affiché au client. Des règles spécifiques peuvent s'appliquer à certaines catégories ou prestataires partenaires.`,
  },
  {
    titre: "5. Interventions et délais",
    texte:
      "Trois niveaux d'urgence sont proposés (immédiate : 2 h ; rapide : 24 h ; planifiée : 72 h). Ces délais sont des engagements de prise en charge, confirmés avec le prestataire. MAIDERES n'est pas partie au contrat de service, qui lie directement le client et le prestataire.",
  },
  {
    titre: "6. Avis et réputation",
    texte:
      "Après une intervention, le client peut publier une note (1 à 5) et un commentaire. Le prestataire peut y répondre. Les avis doivent être sincères et respectueux ; tout contenu injurieux, diffamatoire ou fictif pourra être retiré.",
  },
  {
    titre: "7. Responsabilités",
    texte:
      "MAIDERES agit comme intermédiaire technique. La qualité, la conformité et l'exécution des prestations relèvent de la responsabilité du prestataire. MAIDERES ne saurait être tenu responsable des dommages résultant d'une intervention, sans préjudice de son accompagnement en cas de litige.",
  },
  {
    titre: "8. Litiges",
    texte:
      "En cas de désaccord, le client ou le prestataire contacte MAIDERES via la page Contact. L'équipe examine le dossier avec les deux parties, en s'appuyant sur les échanges, les avis et l'historique de la plateforme.",
  },
  {
    titre: "9. Données personnelles",
    texte:
      "Les données collectées (identité, coordonnées, localisation de quartier) servent exclusivement à la mise en relation et au fonctionnement du compte. Elles ne sont pas revendues à des tiers. Vous pouvez demander leur rectification ou suppression en nous écrivant.",
  },
  {
    titre: "10. Évolution des conditions",
    texte:
      "MAIDERES peut faire évoluer les présentes conditions. La version en vigueur est celle publiée sur cette page. En cas de modification substantielle, les utilisateurs inscrits en sont informés.",
  },
];

function Cgu() {
  return (
    <PageShell
      titre="Conditions générales d'utilisation"
      accroche="Les règles qui encadrent l'utilisation de MAIDERES par les clients et les prestataires."
    >
      <div className="space-y-8">
        {articles.map((a) => (
          <section key={a.titre}>
            <h2 className="text-lg font-extrabold text-primary">{a.titre}</h2>
            <p className="mt-2 text-sm leading-relaxed text-foreground">{a.texte}</p>
          </section>
        ))}
        <p className="rounded-2xl bg-muted px-4 py-3 text-xs text-muted-foreground">
          Dernière mise à jour : septembre 2026. Pour toute question sur ces conditions, écrivez à
          contact@maideres.com.
        </p>
      </div>
    </PageShell>
  );
}
