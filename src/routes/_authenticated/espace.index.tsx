import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { listerPrestataires } from "@/lib/maideres-api";

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
      const { data } = await supabase
        .from("promotions")
        .select("id, titre, remise_pct, description")
        .eq("active", true)
        .limit(6);
      return data ?? [];
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Bienvenue</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Trouvez un prestataire vérifié près de chez vous et suivez vos avis.
        </p>
      </div>

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
              <p className="font-semibold text-foreground">{p.nom_affichage}</p>
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
