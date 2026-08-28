import { createFileRoute, Outlet } from "@tanstack/react-router";
import { EspaceShell } from "@/components/maideres/EspaceShell";

export const Route = createFileRoute("/_authenticated/espace")({
  component: LayoutClient,
});

function LayoutClient() {
  return (
    <EspaceShell
      titre="Espace client"
      liens={[
        { to: "/espace", label: "Tableau de bord" },
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
