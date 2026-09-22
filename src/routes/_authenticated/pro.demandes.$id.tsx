import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  chargerDemande,
  listerMatchings,
  listerInterventions,
  listerEvenementsIntervention,
  listerCategories,
  accepterMatching,
  refuserMatching,
  cloturerMatching,
  checkinIntervention,
  checkoutIntervention,
  updateStatutIntervention,
  reporterIntervention,
  INTERVENTION_TRANSITIONS,
  STATUT_INTERVENTION_LABEL,
  type StatutIntervention,
  type Avis,
} from "@/lib/maideres-api";
import { authorizedFetch } from "@/lib/maideres-core-client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_authenticated/pro/demandes/$id")({
  component: DemandeProDetail,
});

async function lire<T>(res: Response, contexte: string): Promise<T> {
  if (!res.ok) throw new Error(`${contexte} a échoué (${res.status})`);
  return ((await res.json()) as { data: T }).data;
}

const MATCHING_LABEL: Record<string, string> = {
  propose: "Proposition en attente de votre réponse",
  accepte: "Acceptée",
  refuse: "Refusée",
  realise: "Terminée",
  echoue: "Non aboutie",
};

// Actions rapides mises en avant par statut d'intervention — le reste des
// transitions autorisées (INTERVENTION_TRANSITIONS) reste disponible via
// "Autre statut" pour ne pas cacher de cas (report tardif, annulation…).
const ACTION_PRINCIPALE: Partial<
  Record<StatutIntervention, { cible: StatutIntervention; label: string }>
> = {
  planifiee: { cible: "en_route", label: "Je pars en intervention" },
  en_route: { cible: "sur_site", label: "Je suis arrivé (sans check-in précis)" },
  sur_site: { cible: "en_cours", label: "Je commence l'intervention" },
};

function DemandeProDetail() {
  const { id } = Route.useParams();
  const queryClient = useQueryClient();
  const [motifRefus, setMotifRefus] = useState("");
  const [motifEchec, setMotifEchec] = useState("");
  const [afficherRefus, setAfficherRefus] = useState(false);
  const [afficherEchec, setAfficherEchec] = useState(false);
  const [noteClient, setNoteClient] = useState(5);
  const [commentaireClient, setCommentaireClient] = useState("");

  const invalider = () => {
    void queryClient.invalidateQueries({ queryKey: ["pro-demande", id] });
    void queryClient.invalidateQueries({ queryKey: ["demandes-prestataire"] });
  };

  const { data: demande, isLoading } = useQuery({
    queryKey: ["pro-demande", id],
    queryFn: () => chargerDemande(id),
  });

  const { data: categories } = useQuery({ queryKey: ["categories"], queryFn: listerCategories });

  const { data: matchings } = useQuery({
    queryKey: ["pro-matchings", id],
    queryFn: () => listerMatchings({ demande_id: id }),
  });
  // Le plus récent d'abord (GET /api/matchings trie par proposed_at desc) —
  // c'est celui qui reflète l'état actuel si la demande a été re-proposée.
  const matching = matchings?.[0];

  const { data: interventions } = useQuery({
    queryKey: ["pro-interventions", matching?.id],
    queryFn: () => listerInterventions({ matching_id: matching!.id }),
    enabled: Boolean(matching && matching.statut === "accepte"),
  });
  const intervention = interventions?.[0];

  const { data: evenements } = useQuery({
    queryKey: ["pro-evenements", intervention?.id],
    queryFn: () => listerEvenementsIntervention(intervention!.id),
    enabled: Boolean(intervention),
  });

  const mutationErreur = (e: unknown) => toast.error(e instanceof Error ? e.message : "Erreur");

  const accepter = useMutation({
    mutationFn: () => accepterMatching(matching!.id),
    onSuccess: () => {
      toast.success("Demande acceptée — vous pouvez démarrer le suivi.");
      invalider();
    },
    onError: mutationErreur,
  });

  const refuser = useMutation({
    mutationFn: () => refuserMatching(matching!.id, motifRefus),
    onSuccess: () => {
      toast.success("Demande refusée.");
      setAfficherRefus(false);
      invalider();
    },
    onError: mutationErreur,
  });

  const changerStatut = useMutation({
    mutationFn: (statut: StatutIntervention) => updateStatutIntervention(intervention!.id, statut),
    onSuccess: () => {
      invalider();
      void queryClient.invalidateQueries({ queryKey: ["pro-interventions", matching?.id] });
    },
    onError: mutationErreur,
  });

  const checkin = useMutation({
    mutationFn: () => {
      const geoloc = "geolocation" in navigator;
      if (!geoloc) return checkinIntervention(intervention!.id);
      return new Promise<Awaited<ReturnType<typeof checkinIntervention>>>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (pos) =>
            checkinIntervention(
              intervention!.id,
              `${pos.coords.latitude},${pos.coords.longitude}`,
            ).then(resolve, reject),
          () => checkinIntervention(intervention!.id).then(resolve, reject),
          { timeout: 5000 },
        );
      });
    },
    onSuccess: () => {
      toast.success("Arrivée enregistrée.");
      invalider();
      void queryClient.invalidateQueries({ queryKey: ["pro-interventions", matching?.id] });
    },
    onError: mutationErreur,
  });

  const checkout = useMutation({
    mutationFn: () => checkoutIntervention(intervention!.id),
    onSuccess: () => {
      toast.success("Départ enregistré.");
      void queryClient.invalidateQueries({ queryKey: ["pro-interventions", matching?.id] });
    },
    onError: mutationErreur,
  });

  const cloturer = useMutation({
    mutationFn: (issue: "realise" | "echoue") =>
      cloturerMatching(matching!.id, issue, issue === "echoue" ? motifEchec : undefined),
    onSuccess: (_, issue) => {
      toast.success(
        issue === "realise"
          ? "Intervention marquée terminée."
          : "Intervention marquée non aboutie.",
      );
      setAfficherEchec(false);
      invalider();
    },
    onError: mutationErreur,
  });

  const reporter = useMutation({
    mutationFn: (date: string) => reporterIntervention(intervention!.id, date),
    onSuccess: () => {
      toast.success("Intervention reportée.");
      void queryClient.invalidateQueries({ queryKey: ["pro-interventions", matching?.id] });
    },
    onError: mutationErreur,
  });

  // Avis prestataire→client (0036/0039 côté MAIDERES) — signal interne
  // (limite rendez-vous manqués/adresses fantômes), jamais montré au client
  // noté ni sur une fiche publique. filter(auteur==='prestataire') car le
  // même endpoint peut aussi renvoyer l'avis du client sur ce matching.
  const { data: avisClient } = useQuery({
    queryKey: ["avis-matching-prestataire", matching?.id],
    queryFn: async () => {
      const res = await authorizedFetch(`/api/avis?matching_id=${matching!.id}`);
      const rows = await lire<Avis[]>(res, "GET /api/avis");
      return rows.find((a) => a.auteur === "prestataire") ?? null;
    },
    enabled: Boolean(matching && matching.statut === "realise"),
  });

  const publierAvisClient = useMutation({
    mutationFn: async () => {
      const res = await authorizedFetch("/api/avis", {
        method: "POST",
        body: JSON.stringify({
          matching_id: matching!.id,
          note: noteClient,
          commentaire: commentaireClient || null,
        }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error || `Publication échouée (${res.status})`);
      }
    },
    onSuccess: () => {
      toast.success("Avis enregistré — merci.");
      void queryClient.invalidateQueries({ queryKey: ["avis-matching-prestataire", matching?.id] });
    },
    onError: mutationErreur,
  });

  if (isLoading) return <p className="text-sm text-muted-foreground">Chargement…</p>;
  if (!demande) {
    return (
      <div>
        <p className="text-sm text-muted-foreground">Demande introuvable.</p>
        <Link to="/pro/demandes" className="mt-3 inline-block text-sm text-primary">
          ← Gestion de demandes
        </Link>
      </div>
    );
  }

  const libelleCategorie = categories?.find((c) => c.id === demande.categorie_id)?.libelle ?? "—";
  const actionPrincipale = intervention ? ACTION_PRINCIPALE[intervention.statut] : undefined;
  const autresTransitions = intervention
    ? INTERVENTION_TRANSITIONS[intervention.statut].filter((s) => s !== actionPrincipale?.cible)
    : [];

  return (
    <div className="max-w-2xl space-y-6">
      <Link to="/pro/demandes" className="text-sm text-muted-foreground hover:text-primary">
        ← Gestion de demandes
      </Link>

      <div className="rounded-2xl border border-border bg-card p-5">
        <h1 className="font-display text-xl font-bold text-foreground">{libelleCategorie}</h1>
        <p className="mt-3 text-sm text-foreground">{demande.description}</p>
        {demande.localisation && (
          <p className="mt-2 text-xs text-muted-foreground">
            Localisation : {demande.localisation}
          </p>
        )}
        <p className="mt-1 text-xs text-muted-foreground">
          Reçue le{" "}
          {new Date(demande.created_at).toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
      </div>

      {!matching && (
        <p className="text-sm text-muted-foreground">
          Aucune proposition associée à cette demande pour le moment.
        </p>
      )}

      {matching && (
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-display text-lg font-semibold text-foreground">Votre mission</h2>
            <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
              {MATCHING_LABEL[matching.statut] ?? matching.statut}
            </span>
          </div>

          {matching.statut === "propose" && (
            <div className="mt-4 space-y-3">
              <div className="flex flex-wrap gap-2">
                <Button size="sm" onClick={() => accepter.mutate()} disabled={accepter.isPending}>
                  {accepter.isPending ? "…" : "Accepter"}
                </Button>
                <Button size="sm" variant="outline" onClick={() => setAfficherRefus((v) => !v)}>
                  Refuser
                </Button>
              </div>
              {afficherRefus && (
                <div className="space-y-2">
                  <Label htmlFor="motif-refus">Motif (facultatif)</Label>
                  <Textarea
                    id="motif-refus"
                    rows={2}
                    value={motifRefus}
                    onChange={(e) => setMotifRefus(e.target.value)}
                  />
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => refuser.mutate()}
                    disabled={refuser.isPending}
                  >
                    {refuser.isPending ? "…" : "Confirmer le refus"}
                  </Button>
                </div>
              )}
            </div>
          )}

          {matching.statut === "accepte" && intervention && (
            <div className="mt-4 space-y-4 border-t border-border pt-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-foreground">
                  Suivi de l&apos;intervention
                </p>
                <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
                  {STATUT_INTERVENTION_LABEL[intervention.statut]}
                </span>
              </div>

              {["planifiee", "en_route", "sur_site", "en_cours"].includes(intervention.statut) && (
                <div className="flex flex-wrap gap-2">
                  {intervention.statut !== "sur_site" && !intervention.checkin_at && (
                    <Button size="sm" onClick={() => checkin.mutate()} disabled={checkin.isPending}>
                      {checkin.isPending ? "…" : "Je suis arrivé (check-in)"}
                    </Button>
                  )}
                  {actionPrincipale && (
                    <Button
                      size="sm"
                      variant={intervention.statut === "sur_site" ? "default" : "outline"}
                      onClick={() => changerStatut.mutate(actionPrincipale.cible)}
                      disabled={changerStatut.isPending}
                    >
                      {changerStatut.isPending ? "…" : actionPrincipale.label}
                    </Button>
                  )}
                  {intervention.checkin_at && !intervention.checkout_at && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => checkout.mutate()}
                      disabled={checkout.isPending}
                    >
                      {checkout.isPending ? "…" : "Je quitte le site (check-out)"}
                    </Button>
                  )}
                </div>
              )}

              {intervention.statut === "en_cours" && (
                <div className="space-y-2 border-t border-border pt-3">
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      onClick={() => cloturer.mutate("realise")}
                      disabled={cloturer.isPending}
                    >
                      {cloturer.isPending ? "…" : "Terminer — intervention réussie"}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setAfficherEchec((v) => !v)}>
                      Marquer non aboutie
                    </Button>
                  </div>
                  {afficherEchec && (
                    <div className="space-y-2">
                      <Label htmlFor="motif-echec">Motif (obligatoire)</Label>
                      <Textarea
                        id="motif-echec"
                        rows={2}
                        value={motifEchec}
                        onChange={(e) => setMotifEchec(e.target.value)}
                      />
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => cloturer.mutate("echoue")}
                        disabled={cloturer.isPending || !motifEchec.trim()}
                      >
                        {cloturer.isPending ? "…" : "Confirmer"}
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {autresTransitions.includes("reportee") && (
                <details className="border-t border-border pt-3 text-sm">
                  <summary className="cursor-pointer text-muted-foreground">
                    Reporter à une autre date
                  </summary>
                  <ReporterForm
                    onValider={(date) => reporter.mutate(date)}
                    isPending={reporter.isPending}
                  />
                </details>
              )}

              {evenements && evenements.length > 0 && (
                <details className="border-t border-border pt-3 text-sm">
                  <summary className="cursor-pointer text-muted-foreground">
                    Historique ({evenements.length})
                  </summary>
                  <ul className="mt-2 space-y-1.5">
                    {evenements.map((ev) => (
                      <li key={ev.id} className="text-xs text-muted-foreground">
                        {new Date(ev.created_at).toLocaleString("fr-FR")} — {ev.type}
                        {ev.nouveau_statut
                          ? ` → ${STATUT_INTERVENTION_LABEL[ev.nouveau_statut]}`
                          : ""}
                        {ev.commentaire ? ` (${ev.commentaire})` : ""}
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          )}

          {matching.statut === "realise" && (
            <div className="mt-4 border-t border-border pt-4">
              {avisClient ? (
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Votre avis sur ce client : {avisClient.note}/5
                  </p>
                  {avisClient.commentaire && (
                    <p className="mt-1 text-sm text-muted-foreground">{avisClient.commentaire}</p>
                  )}
                  <p className="mt-2 text-xs text-muted-foreground">
                    Non visible par le client — sert uniquement en interne.
                  </p>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    publierAvisClient.mutate();
                  }}
                  className="space-y-3"
                >
                  <p className="text-sm font-semibold text-foreground">Notez ce client</p>
                  <p className="text-xs text-muted-foreground">
                    Ponctualité, adresse correcte, accueil — reste privé, jamais montré au client ni
                    sur votre fiche publique.
                  </p>
                  <div className="space-y-1.5">
                    <Label htmlFor="note-client">Note</Label>
                    <select
                      id="note-client"
                      value={noteClient}
                      onChange={(e) => setNoteClient(Number(e.target.value))}
                      className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                    >
                      {[5, 4, 3, 2, 1].map((n) => (
                        <option key={n} value={n}>
                          {n}/5
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="com-client">Commentaire (facultatif)</Label>
                    <Textarea
                      id="com-client"
                      rows={3}
                      value={commentaireClient}
                      onChange={(e) => setCommentaireClient(e.target.value)}
                    />
                  </div>
                  <Button type="submit" size="sm" disabled={publierAvisClient.isPending}>
                    {publierAvisClient.isPending ? "Envoi…" : "Enregistrer"}
                  </Button>
                </form>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ReporterForm({
  onValider,
  isPending,
}: {
  onValider: (dateIso: string) => void;
  isPending: boolean;
}) {
  const [date, setDate] = useState("");
  return (
    <div className="mt-2 flex flex-wrap items-end gap-2">
      <div className="space-y-1.5">
        <Label htmlFor="date-report">Nouvelle date</Label>
        <input
          id="date-report"
          type="datetime-local"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
        />
      </div>
      <Button
        size="sm"
        variant="outline"
        disabled={!date || isPending}
        onClick={() => onValider(new Date(date).toISOString())}
      >
        {isPending ? "…" : "Confirmer le report"}
      </Button>
    </div>
  );
}
