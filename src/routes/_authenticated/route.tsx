import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      // Préserve la page visée (ex: créer une demande depuis une offre
      // précise) pour y revenir juste après connexion — sinon un visiteur
      // non connecté perdait systématiquement son contexte en cours de
      // route. Ignoré si la cible est déjà une page d'auth (pas de boucle).
      const cible = location.href;
      throw redirect({
        to: "/auth/client",
        ...(cible.startsWith("/auth/") ? {} : { search: { redirect: cible } }),
      });
    }
    return { user: data.user };
  },
  component: () => <Outlet />,
});
