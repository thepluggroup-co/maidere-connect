import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { authorizedFetch } from "@/lib/maideres-core-client";
import { listerCategories, type Demande } from "@/lib/maideres-api";

export const Route = createFileRoute("/_authenticated/espace/demandes/")({
  component: MesDemandes,
});

const STATUT_LABEL: Record<Demande["statut"], string> = {
  nouvelle: "Nouvelle",
  en_traitement: "En traitement",
  matchee: "Prestataire trouvé",
  en_cours: "Intervention en cours",
  realisee: "Réalisée",
  annulee: "Annulée",
};

const STATUT_STYLE: Record<Demande["statut"], string> = {
  nouvelle: "bg-muted text-muted-foreground",
  en_traitement: "bg-primary/10 text-primary",
  matchee: "bg-secondary/10 text-secondary",
  en_cours: "bg-secondary/10 text-secondary",
  realisee: "bg-emerald-500/10 text-emerald-600",
  annulee: "bg-destructive/10 text-destructive",
};

function MesDemandes() {
  const { data: demandes, isLoading } = useQuery({
    queryKey: ["mes-demandes"],
    queryFn: async () => {
      const res = await authorizedFetch("/api/demandes");
      return (await res.json()).data as Demande[];
    },
  });

  const { data: categories } = useQuery({ queryKey: ["categories"], queryFn: listerCategories });
  const libelleCategorie = (id: string) => categories?.find((c) => c.id === id)?.libelle ?? "—";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Mes demandes</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Suivez vos demandes de service et l'avancement du prestataire assigné.
          </p>
        </div>
        <Link
          to="/espace/demandes/nouvelle"
          className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground"
        >
          Nouvelle demande
        </Link>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Chargement…</p>
      ) : (demandes?.length ?? 0) === 0 ? (
        <p className="text-sm text-muted-foreground">Vous n'avez pas encore fait de demande.</p>
      ) : (
        <ul className="space-y-3">
          {demandes!.map((d) => (
            <li key={d.id}>
              <Link
                to="/espace/demandes/$id"
                params={{ id: d.id }}
                className="block rounded-2xl border border-border bg-card p-4 hover:shadow-md"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold text-foreground">{libelleCategorie(d.categorie_id)}</p>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUT_STYLE[d.statut]}`}>
                    {STATUT_LABEL[d.statut]}
                  </span>
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{d.description}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {new Date(d.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
