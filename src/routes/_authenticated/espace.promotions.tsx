import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/espace/promotions")({
  component: PromotionsClient,
});

function PromotionsClient() {
  const { data, isLoading } = useQuery({
    queryKey: ["promotions-actives"],
    queryFn: async () => {
      const { data: promos } = await supabase
        .from("promotions")
        .select("id, titre, description, remise_pct, prestataire_id, fin")
        .eq("active", true)
        .order("remise_pct", { ascending: false });
      return promos ?? [];
    },
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-foreground">Promotions du moment</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Offres à prix réduit proposées par les prestataires MAIDERES.
      </p>

      {isLoading ? (
        <p className="mt-6 text-sm text-muted-foreground">Chargement…</p>
      ) : (data?.length ?? 0) === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">Aucune promotion active.</p>
      ) : (
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {data!.map((p) => (
            <Link
              key={p.id}
              to="/prestataires/$id"
              params={{ id: p.prestataire_id }}
              className="rounded-2xl border border-secondary/40 bg-card p-4 hover:shadow-md"
            >
              <p className="font-display text-lg font-bold text-secondary">−{p.remise_pct}%</p>
              <p className="mt-1 font-semibold text-foreground">{p.titre}</p>
              {p.description && (
                <p className="mt-1 text-sm text-muted-foreground">{p.description}</p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
