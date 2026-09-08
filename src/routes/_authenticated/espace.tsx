import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { EspaceShell } from "@/components/maideres/EspaceShell";
import { supabase } from "@/integrations/supabase/client";
import { resoudreIdentitePourUtilisateur } from "@/lib/maideres-core-client";

export const Route = createFileRoute("/_authenticated/espace")({
  // _authenticated/route.tsx a déjà vérifié qu'une session existe. Ici on
  // vérifie en plus que ce n'est pas un compte prestataire égaré sur
  // l'espace client (cf. docs/integration/08-SECURITY-AUDIT.md — l'ancien
  // garde-fou ne distinguait aucun rôle). Défense d'UX seulement : la vraie
  // frontière de sécurité reste l'API/RLS (MAIDERES §18).
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) return;
    const identite = await resoudreIdentitePourUtilisateur(data.user).catch(() => null);
    if (identite?.prestataireId && !identite.clientId) throw redirect({ to: "/pro" });
  },
  component: LayoutClient,
});

function LayoutClient() {
  return (
    <EspaceShell
      titre="Espace client"
      liens={[
        { to: "/espace", label: "Tableau de bord" },
        { to: "/espace/demandes", label: "Mes demandes" },
        { to: "/espace/recherche", label: "Recherche" },
        { to: "/espace/promotions", label: "Promotions" },
        { to: "/espace/avis", label: "Mes avis" },
        { to: "/espace/profil", label: "Profil" },
      ]}
    >
      <Outlet />
    </EspaceShell>
  );
}
