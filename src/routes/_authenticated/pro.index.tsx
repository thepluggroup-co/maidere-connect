import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ShieldCheck, MapPin, ArrowRight } from "lucide-react";
import { authorizedFetch } from "@/lib/maideres-core-client";
import {
  maFichePrestataire,
  listerDemandes,
  moyenne,
  type Offre,
  type Promotion,
  type Demande,
} from "@/lib/maideres-api";
import { PrimaryButton } from "@/components/maideres/PrimaryButton";
import { SecondaryButton } from "@/components/maideres/SecondaryButton";

export const Route = createFileRoute("/_authenticated/pro/")({
  component: TableauPro,
});

// Demandes considérées "en cours" pour ce tableau de bord — tout ce qui
// n'est pas terminé ou annulé. Même logique que le filtre déjà utilisé
// ailleurs (packages/contracts) pour "actif".
const STATUTS_EN_COURS: Demande["statut"][] = ["nouvelle", "en_traitement", "matchee", "en_cours"];

const STATUT_LABEL: Record<Demande["statut"], string> = {
  nouvelle: "Nouvelle",
  en_traitement: "En traitement",
  matchee: "Prestataire trouvé",
  en_cours: "Intervention en cours",
  realisee: "Réalisée",
  annulee: "Annulée",
};

function TableauPro() {
  const { data, isLoading } = useQuery({
    queryKey: ["tableau-pro"],
    queryFn: async () => {
      const fiche = await maFichePrestataire();
      if (!fiche)
        return {
          fiche: null,
          offres: 0,
          promos: 0,
          avis: [] as { note: number }[],
          demandes: [] as Demande[],
        };
      const [offresRes, promosRes, demandes] = await Promise.all([
        authorizedFetch("/api/offres"),
        authorizedFetch("/api/promotions"),
        listerDemandes(),
      ]);
      const offres = ((await offresRes.json()) as { data: Offre[] }).data;
      const promos = ((await promosRes.json()) as { data: Promotion[] }).data;
      return {
        fiche,
        offres: offres.length,
        promos: promos.filter((p) => p.active !== false).length,
        // Avis pas encore branchés côté API — voir maideres-api.ts.
        avis: [] as { note: number }[],
        demandes,
      };
    },
    refetchInterval: 15000,
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
        <Link
          to="/pro/profil"
          className="mt-4 inline-block text-sm font-semibold text-[var(--ring)]"
        >
          Créer ma fiche →
        </Link>
      </div>
    );
  }

  const note = moyenne(data.avis);
  const fiche = data.fiche;
  const enCours = data.demandes.filter((d) => STATUTS_EN_COURS.includes(d.statut));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">{fiche.nom}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {fiche.metier_libelle} · {fiche.quartier ? `${fiche.quartier}, ` : ""}
          {fiche.ville}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Carte titre="Offres" valeur={String(data.offres)} />
        <Carte titre="Promotions actives" valeur={String(data.promos)} />
        <Carte titre="Avis reçus" valeur={String(data.avis.length)} />
        <Carte titre="Note moyenne" valeur={data.avis.length ? `${note.toFixed(1)}/5` : "—"} />
      </div>

      {/* Aperçu de la fiche publique — ce que voit un client, pas juste un
          lien pour y aller. Demandé explicitement par Johanne : le lien
          seul en bas de page passait inaperçu. */}
      <section className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Votre fiche publique
          </p>
          <Link
            to="/prestataires/$id"
            params={{ id: fiche.id }}
            className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--ring)] hover:underline"
          >
            Voir la fiche complète <ArrowRight className="size-3" />
          </Link>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <h2 className="text-lg font-bold text-foreground">{fiche.nom}</h2>
          {fiche.statut !== "en_attente" && (
            <span className="inline-flex items-center gap-1 rounded-full bg-etat-succes px-2 py-0.5 text-xs font-semibold text-etat-succes-fg">
              <ShieldCheck className="size-3.5" aria-hidden="true" />
              Réseau vérifié
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-primary">{fiche.metier_libelle}</p>
        <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
          {fiche.quartier ? `${fiche.quartier}, ` : ""}
          {fiche.ville}
        </p>
        {fiche.bio && <p className="mt-3 text-sm text-muted-foreground">{fiche.bio}</p>}
      </section>

      {/* Demandes en cours — absent du tableau de bord jusqu'ici, seulement
          accessible via /pro/demandes. Demandé explicitement par Johanne. */}
      <section>
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-lg font-bold text-foreground">
            Demandes en cours {enCours.length > 0 && `(${enCours.length})`}
          </h2>
          <Link
            to="/pro/demandes"
            className="text-xs font-semibold text-[var(--ring)] hover:underline"
          >
            Tout voir
          </Link>
        </div>
        {enCours.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">
            Aucune demande en cours pour le moment.
          </p>
        ) : (
          <ul className="mt-3 space-y-3">
            {enCours.slice(0, 5).map((demande) => (
              <li key={demande.id}>
                <Link
                  to="/pro/demandes/$id"
                  params={{ id: demande.id }}
                  className="block rounded-2xl border border-border bg-card p-4 transition-colors hover:border-[var(--ring)]/40"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold text-foreground">{demande.description}</p>
                    <span className="rounded-full bg-info px-2.5 py-1 text-xs font-semibold text-info-foreground">
                      {STATUT_LABEL[demande.statut]}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {demande.localisation ?? "Localisation non précisée"} ·{" "}
                    {new Date(demande.created_at).toLocaleDateString("fr-FR")}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="flex flex-wrap gap-3">
        <SecondaryButton asChild>
          <Link to="/pro/offres">Gérer mes offres</Link>
        </SecondaryButton>
        <PrimaryButton asChild>
          <Link to="/prestataires/$id" params={{ id: fiche.id }}>
            Voir ma fiche publique
          </Link>
        </PrimaryButton>
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
