import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { authorizedFetch } from "@/lib/maideres-core-client";
import type { Demande } from "@/lib/maideres-api";

export const Route = createFileRoute("/_authenticated/pro/demandes")({
  component: GestionDemandesPro,
});

const STATUT_LABEL: Record<Demande["statut"], string> = {
  nouvelle: "Nouvelle",
  en_traitement: "En traitement",
  matchee: "Prestataire trouvé",
  en_cours: "Intervention en cours",
  realisee: "Réalisée",
  annulee: "Annulée",
};

function GestionDemandesPro() {
  const { data, isLoading } = useQuery({
    queryKey: ["demandes-prestataire"],
    queryFn: async () => {
      const res = await authorizedFetch("/api/demandes");
      if (!res.ok) throw new Error(`GET /api/demandes a échoué (${res.status})`);
      return ((await res.json()) as { data: Demande[] }).data;
    },
    refetchInterval: 15000,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Gestion de demandes</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Consultez les demandes qui vous sont attribuées et leur avancement dans l&apos;ERP.
        </p>
      </div>
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Chargement…</p>
      ) : (data?.length ?? 0) === 0 ? (
        <p className="text-sm text-muted-foreground">Aucune demande attribuée.</p>
      ) : (
        <ul className="space-y-3">
          {data!.map((demande) => (
            <li key={demande.id} className="rounded-2xl border border-border bg-card p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold text-foreground">{demande.description}</p>
                <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                  {STATUT_LABEL[demande.statut]}
                </span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {demande.localisation ?? "Localisation non précisée"} · {new Date(demande.created_at).toLocaleDateString("fr-FR")}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
