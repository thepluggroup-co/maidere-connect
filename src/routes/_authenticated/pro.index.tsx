import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { maFichePrestataire, moyenne } from "@/lib/maideres-api";

export const Route = createFileRoute("/_authenticated/pro/")({
  component: TableauPro,
});

function TableauPro() {
  const { data, isLoading } = useQuery({
    queryKey: ["tableau-pro"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return null;
      const fiche = await maFichePrestataire(u.user.id);
      if (!fiche) return { fiche: null, offres: 0, promos: 0, avis: [] as { note: number }[] };
      const [offres, promos, avis] = await Promise.all([
        supabase.from("offres").select("id").eq("prestataire_id", fiche.id),
        supabase.from("promotions").select("id").eq("prestataire_id", fiche.id).eq("active", true),
        supabase.from("avis").select("note").eq("prestataire_id", fiche.id),
      ]);
      return {
        fiche,
        offres: offres.data?.length ?? 0,
        promos: promos.data?.length ?? 0,
        avis: (avis.data ?? []) as { note: number }[],
      };
    },
  });

  if (isLoading) return <p className="text-sm text-muted-foreground">Chargement…</p>;

  if (!data?.fiche) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6">
        <h1 className="font-display text-xl font-bold text-foreground">Complétez votre fiche</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Votre fiche prestataire n'est pas encore créée. Renseignez votre profil professionnel pour
          apparaître dans la recherche.
        </p>
        <Link to="/pro/profil" className="mt-4 inline-block text-sm font-semibold text-primary">
          Créer ma fiche →
        </Link>
      </div>
    );
  }

  const note = moyenne(data.avis);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">
          {data.fiche.nom_affichage}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {data.fiche.metier} · {data.fiche.quartier ? `${data.fiche.quartier}, ` : ""}
          {data.fiche.ville}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Carte titre="Offres" valeur={String(data.offres)} />
        <Carte titre="Promotions actives" valeur={String(data.promos)} />
        <Carte titre="Avis reçus" valeur={String(data.avis.length)} />
        <Carte titre="Note moyenne" valeur={data.avis.length ? `${note.toFixed(1)}/5` : "—"} />
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          to="/pro/offres"
          className="rounded-full bg-secondary px-5 py-2 text-sm font-semibold text-secondary-foreground"
        >
          Gérer mes offres
        </Link>
        <Link
          to="/prestataires/$id"
          params={{ id: data.fiche.id }}
          className="rounded-full border border-border px-5 py-2 text-sm font-semibold text-foreground"
        >
          Voir ma fiche publique
        </Link>
      </div>
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
