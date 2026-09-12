import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { authorizedFetch, publicFetch } from "@/lib/maideres-core-client";
import { listerPrestataires, type Demande } from "@/lib/maideres-api";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export const Route = createFileRoute("/_authenticated/espace/")({
  component: TableauClient,
});

function TableauClient() {
  const { data: prestataires } = useQuery({
    queryKey: ["espace-prestataires"],
    queryFn: () => listerPrestataires({}),
  });

  const { data: promos } = useQuery({
    queryKey: ["espace-promos"],
    queryFn: async () => {
      const res = await publicFetch("/api/public/promotions?limit=6");
      const body = (await res.json()) as { data: { id: string; titre: string; remise_pct: number; description: string | null }[] };
      return body.data ?? [];
    },
  });

  const { data: demandes } = useQuery({
    queryKey: ["espace-demandes-dashboard"],
    queryFn: async () => {
      const res = await authorizedFetch("/api/demandes");
      if (!res.ok) throw new Error(`GET /api/demandes a échoué (${res.status})`);
      return ((await res.json()) as { data: Demande[] }).data;
    },
    refetchInterval: 15000,
  });

  const [promotionIndex, setPromotionIndex] = useState(0);
  const promotions = promos ?? [];
  const promotion = promotions[promotionIndex % Math.max(promotions.length, 1)];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Bienvenue</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Trouvez un prestataire vérifié près de chez vous et suivez vos avis.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button asChild>
          <Link to="/espace/demandes/nouvelle">Nouvelle demande</Link>
        </Button>
        <Link to="/espace/demandes" className="text-sm font-semibold text-primary hover:underline">
          Voir toutes mes demandes
        </Link>
      </div>

      {promotions.length > 0 && promotion && (
        <section className="rounded-2xl bg-secondary p-6 text-secondary-foreground">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-wide opacity-75">Actualités & promotions</p>
              <h2 className="mt-1 font-display text-xl font-bold">{promotion.titre}</h2>
              <p className="mt-1 text-sm opacity-90">{promotion.description ?? `−${promotion.remise_pct}% sur cette offre`}</p>
            </div>
            <div className="flex gap-2">
              <button type="button" aria-label="Promotion précédente" onClick={() => setPromotionIndex((i) => (i - 1 + promotions.length) % promotions.length)} className="rounded-full border border-white/40 px-3 py-1">←</button>
              <button type="button" aria-label="Promotion suivante" onClick={() => setPromotionIndex((i) => (i + 1) % promotions.length)} className="rounded-full border border-white/40 px-3 py-1">→</button>
            </div>
          </div>
        </section>
      )}

      <section>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-foreground">Demandes en cours</h2>
          <Link to="/espace/demandes" className="text-sm text-primary hover:underline">Tout voir</Link>
        </div>
        <div className="mt-3 space-y-2">
          {(demandes ?? []).filter((d) => !["realisee", "annulee"].includes(d.statut)).slice(0, 4).map((d) => (
            <Link key={d.id} to="/espace/demandes/$id" params={{ id: d.id }} className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
              <span className="line-clamp-1 text-sm text-foreground">{d.description}</span>
              <span className="ml-3 shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">{d.statut.replace("_", " ")}</span>
            </Link>
          ))}
          {(demandes ?? []).filter((d) => !["realisee", "annulee"].includes(d.statut)).length === 0 && (
            <p className="text-sm text-muted-foreground">Aucune demande en cours.</p>
          )}
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-3">
        <Carte titre="Prestataires disponibles" valeur={String(prestataires?.length ?? 0)} />
        <Carte titre="Promotions actives" valeur={String(promos?.length ?? 0)} />
        <Carte titre="Villes couvertes" valeur="3" />
      </div>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-foreground">
            Prestataires en vedette
          </h2>
          <Link to="/espace/recherche" className="text-sm text-primary hover:underline">
            Voir la recherche
          </Link>
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(prestataires ?? []).slice(0, 6).map((p) => (
            <Link
              key={p.id}
              to="/prestataires/$id"
              params={{ id: p.id }}
              className="rounded-2xl border border-border bg-card p-4 hover:shadow-md"
            >
              <p className="font-semibold text-foreground">{p.nom}</p>
              <p className="text-sm text-primary">{p.metier}</p>
              <p className="text-xs text-muted-foreground">
                {p.quartier ? `${p.quartier}, ` : ""}
                {p.ville}
              </p>
            </Link>
          ))}
        </div>
        {(prestataires?.length ?? 0) === 0 && (
          <p className="mt-3 text-sm text-muted-foreground">
            Aucun prestataire publié pour le moment.
          </p>
        )}
      </section>
    </div>
  );
}

function Carte({ titre, valeur }: { titre: string; valeur: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{titre}</p>
      <p className="mt-2 font-display text-2xl font-bold text-primary">{valeur}</p>
    </div>
  );
}
