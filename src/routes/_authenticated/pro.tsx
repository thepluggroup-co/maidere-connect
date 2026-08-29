import { createFileRoute, Outlet } from "@tanstack/react-router";
import { EspaceShell } from "@/components/maideres/EspaceShell";

export const Route = createFileRoute("/_authenticated/pro")({
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
