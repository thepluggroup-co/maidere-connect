import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import logo from "@/assets/maideres-logo.asset.json";
import type { ReactNode } from "react";

export type LienEspace = { to: string; label: string };

export function EspaceShell({
  titre,
  liens,
  children,
}: {
  titre: string;
  liens: LienEspace[];
  children: ReactNode;
}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function deconnexion() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    void navigate({ to: "/", replace: true });
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo.url} alt="MAIDERES" className="h-9 w-auto object-contain" />
          </Link>
          <span className="font-display text-sm font-semibold text-secondary">{titre}</span>
          <nav className="ml-auto flex flex-wrap items-center gap-1">
            {liens.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                activeOptions={{ exact: l.to.split("/").length === 2 }}
                activeProps={{ className: "bg-primary/10 text-primary" }}
                className="rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-primary"
              >
                {l.label}
              </Link>
            ))}
            <Button variant="outline" size="sm" className="ml-2" onClick={() => void deconnexion()}>
              Déconnexion
            </Button>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
