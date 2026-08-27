import { createFileRoute } from "@tanstack/react-router";
import { AuthCard } from "@/components/maideres/AuthCard";

export const Route = createFileRoute("/auth/prestataire")({
  head: () => ({
    meta: [
      { title: "Espace prestataire — Inscription MAIDERES" },
      {
        name: "description",
        content:
          "Créez votre compte prestataire MAIDERES : publiez vos offres, votre galerie de réalisations et recevez des avis clients.",
      },
      { property: "og:title", content: "Espace prestataire — Inscription MAIDERES" },
      { property: "og:description", content: "Publiez vos offres et développez votre activité." },
    ],
  }),
  component: () => <AuthCard role="prestataire" />,
});
