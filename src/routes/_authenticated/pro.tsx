import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { EspaceShell } from "@/components/maideres/EspaceShell";
import { supabase } from "@/integrations/supabase/client";
import { resoudreIdentitePourUtilisateur } from "@/lib/maideres-core-client";

export const Route = createFileRoute("/_authenticated/pro")({
  // Symétrique de espace.tsx : un compte client égaré sur l'espace
  // prestataire est renvoyé vers /espace. Défense d'UX seulement — voir
  // le commentaire dans espace.tsx.
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) return;
    const identite = await resoudreIdentitePourUtilisateur(data.user).catch(() => null);
    if (identite?.clientId && !identite.prestataireId) throw redirect({ to: "/espace" });
  },
  component: LayoutPro,
});

function LayoutPro() {
  return (
    <EspaceShell
      titre="Espace prestataire"
      liens={[
        { to: "/pro", label: "Tableau de bord" },
        { to: "/pro/offres", label: "Mes offres" },
        { to: "/pro/galerie", label: "Galerie" },
        { to: "/pro/avis", label: "Avis reçus" },
        { to: "/pro/profil", label: "Profil pro" },
      ]}
    >
      <Outlet />
    </EspaceShell>
  );
}
