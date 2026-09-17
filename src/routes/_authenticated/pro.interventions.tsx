import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  listerInterventions,
  listerMatchings,
  listerDemandes,
  listerCategories,
  type Intervention,
  type StatutIntervention,
  type Demande,
  STATUT_INTERVENTION_LABEL,
} from "@/lib/maideres-api";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/pro/interventions")({
  component: InterventionsPro,
});

// Mêmes 4 colonnes que le tableau Console 360 (apps/web/src/pages/Interventions.tsx,
// repo MAIDERES) — les statuts terminaux (réalisée/échouée/reportée/annulée) ne
// sont pas des colonnes actives, ils redeviennent visibles depuis le détail
// d'une demande (/pro/demandes/$id) où ils sont déjà consultables.
const COLONNES: { statut: StatutIntervention; label: string }[] = [
  { statut: "planifiee", label: "Planifiée" },
  { statut: "en_route", label: "En route" },
  { statut: "sur_site", label: "Sur site" },
  { statut: "en_cours", label: "En cours" },
];

function resteAvantDelai(delai: string | null | undefined): string {
  if (!delai) return "—";
  const diff = new Date(delai).getTime() - Date.now();
  const abs = Math.abs(diff);
  const hh = Math.floor(abs / 3_600_000);
  const mm = Math.floor((abs % 3_600_000) / 60_000);
  const texte = hh >= 24 ? `${Math.floor(hh / 24)} j ${hh % 24} h` : hh > 0 ? `${hh} h ${mm} min` : `${mm} min`;
  return diff < 0 ? `retard ${texte}` : `dans ${texte}`;
}

function InterventionsPro() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data: interventions = [], isLoading } = useQuery({
    queryKey: ["pro-interventions-kanban"],
    queryFn: () => listerInterventions(),
    refetchInterval: 15000,
  });
  const { data: matchings = [] } = useQuery({
    queryKey: ["pro-matchings-kanban"],
    queryFn: () => listerMatchings(),
  });
  const { data: demandes = [] } = useQuery({
    queryKey: ["pro-demandes-kanban"],
    queryFn: listerDemandes,
  });
  const { data: categories = [] } = useQuery({ queryKey: ["categories"], queryFn: listerCategories });

  const matchingById = useMemo(() => new Map(matchings.map((m) => [m.id, m])), [matchings]);
  const demandeById = useMemo(() => new Map(demandes.map((d) => [d.id, d])), [demandes]);
  const catLabel = useMemo(() => new Map(categories.map((c) => [c.id, c.libelle])), [categories]);

  const demandeDe = (intervention: Intervention): Demande | undefined => {
    const matching = matchingById.get(intervention.matching_id);
    return matching ? demandeById.get(matching.demande_id) : undefined;
  };

  // Retard calculé directement depuis delai_cible (pas de seuil "à risque"
  // ici : /api/sla_config est réservé au staff, cf. apps/api/src/routes/
  // sla-config.ts — seul le dépassement pur, sans configuration, est
  // vérifiable côté prestataire).
  const enRetard = (intervention: Intervention): boolean => {
    const d = demandeDe(intervention);
    return Boolean(d?.delai_cible && new Date(d.delai_cible).getTime() < Date.now());
  };

  const parColonne = useMemo(() => {
    const map = new Map<StatutIntervention, Intervention[]>();
    for (const col of COLONNES) map.set(col.statut, []);
    for (const i of interventions) {
      if (map.has(i.statut)) map.get(i.statut)!.push(i);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    return map;
  }, [interventions, matchings, demandes]);

  const alertesRetard = useMemo(
    () => interventions.filter((i) => COLONNES.some((c) => c.statut === i.statut) && enRetard(i)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [interventions, matchings, demandes],
  );

  const selected = interventions.find((i) => i.id === selectedId) ?? null;
  const selectedDemande = selected ? demandeDe(selected) : undefined;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Mes interventions</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Vue d'ensemble de vos interventions en cours. Pour accepter une nouvelle demande ou
          consulter l'historique complet, direction{" "}
          <Link to="/pro/demandes" className="text-primary hover:underline">
            Gestion de demandes
          </Link>
          .
        </p>
      </div>

      {alertesRetard.length > 0 && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-destructive">
            En retard ({alertesRetard.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {alertesRetard.map((i) => {
              const d = demandeDe(i);
              return (
                <button
                  key={i.id}
                  type="button"
                  onClick={() => setSelectedId(i.id)}
                  className="rounded-md border border-destructive/30 bg-destructive/10 px-2.5 py-1 text-xs text-destructive hover:bg-destructive/20"
                >
                  {catLabel.get(d?.categorie_id ?? "") ?? "—"} · {resteAvantDelai(d?.delai_cible)}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Chargement…</p>
      ) : interventions.length === 0 ? (
        <p className="text-sm text-muted-foreground">Aucune intervention en cours pour le moment.</p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {COLONNES.map((col) => {
            const cartes = parColonne.get(col.statut) ?? [];
            return (
              <div key={col.statut} className="min-h-[180px] rounded-2xl border border-border bg-card p-3">
                <div className="mb-2.5 flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {col.label}
                  </h3>
                  <span className="rounded-full bg-muted px-1.5 py-0.5 text-[11px] font-semibold text-muted-foreground">
                    {cartes.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {cartes.length === 0 && <p className="text-xs text-muted-foreground">Aucune.</p>}
                  {cartes.map((i) => {
                    const d = demandeDe(i);
                    const retard = enRetard(i);
                    return (
                      <button
                        key={i.id}
                        type="button"
                        onClick={() => setSelectedId(i.id)}
                        className="block w-full rounded-xl border border-border bg-background p-2.5 text-left transition-colors hover:border-primary/40"
                      >
                        <p className="text-sm font-medium text-foreground">
                          {catLabel.get(d?.categorie_id ?? "") ?? "—"}
                        </p>
                        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{d?.description}</p>
                        {d?.delai_cible && (
                          <Badge
                            variant={retard ? "destructive" : "secondary"}
                            className="mt-2"
                          >
                            {resteAvantDelai(d.delai_cible)}
                          </Badge>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Sheet open={selected !== null} onOpenChange={(open) => !open && setSelectedId(null)}>
        <SheetContent className="overflow-y-auto sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>{catLabel.get(selectedDemande?.categorie_id ?? "") ?? "Intervention"}</SheetTitle>
            <SheetDescription>
              {selectedDemande?.description}
              {selected && (
                <span className="mt-2 block">
                  <Badge variant="secondary">{STATUT_INTERVENTION_LABEL[selected.statut]}</Badge>
                </span>
              )}
            </SheetDescription>
          </SheetHeader>
          {selected && (
            <div className="mt-4">
              <Link
                to="/pro/demandes/$id"
                params={{ id: matchingById.get(selected.matching_id)?.demande_id ?? "" }}
                className="text-sm text-primary hover:underline"
              >
                Ouvrir la demande — check-in, check-out, changement de statut →
              </Link>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
