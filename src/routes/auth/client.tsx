import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { AuthCard } from "@/components/maideres/AuthCard";

export const Route = createFileRoute("/auth/client")({
  validateSearch: z.object({ redirect: z.string().optional() }),
  head: () => ({
    meta: [
      { title: "Espace client — Connexion MAIDERES" },
      {
        name: "description",
        content:
          "Connectez-vous ou créez votre compte client MAIDERES pour trouver des prestataires vérifiés à Douala, Yaoundé et Abidjan.",
      },
      { property: "og:title", content: "Espace client — Connexion MAIDERES" },
      {
        property: "og:description",
        content: "Trouvez des prestataires vérifiés près de chez vous.",
      },
    ],
  }),
  component: ClientAuthPage,
});

function ClientAuthPage() {
  const { redirect: redirectTo } = Route.useSearch();
  return <AuthCard role="client" {...(redirectTo ? { redirectTo } : {})} />;
}
