import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { authorizedFetch } from "@/lib/maideres-core-client";
import { listerCategories, type Demande, type Matching, type Avis, type Prestataire } from "@/lib/maideres-api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_authenticated/espace/demandes/$id")({
  component: DemandeDetail,
});

async function lire<T>(res: Response, contexte: string): Promise<T> {
  if (!res.ok) throw new Error(`${contexte} a échoué (${res.status})`);
  return ((await res.json()) as { data: T }).data;
}

const STATUT_LABEL: Record<Demande["statut"], string> = {
  nouvelle: "Nouvelle — en attente de traitement",
  en_traitement: "En traitement par un opérateur",
  matchee: "Prestataire trouvé",
  en_cours: "Intervention en cours",
  realisee: "Réalisée",
  annulee: "Annulée",
};

const MATCHING_LABEL: Record<Matching["statut"], string> = {
  propose: "Proposition envoyée au prestataire",
  accepte: "Acceptée — intervention à venir",
  refuse: "Refusée par le prestataire",
  realise: "Intervention réalisée",
  echoue: "Intervention non aboutie",
};

function DemandeDetail() {
  const { id } = Route.useParams();
  const queryClient = useQueryClient();
  const [note, setNote] = useState(5);
  const [commentaire, setCommentaire] = useState("");

  const { data: demande, isLoading } = useQuery({
    queryKey: ["demande", id],
    queryFn: async () => lire<Demande>(await authorizedFetch(`/api/demandes/${id}`), "GET /api/demandes/:id"),
  });

  const { data: categories } = useQuery({ queryKey: ["categories"], queryFn: listerCategories });

  const { data: matchings } = useQuery({
    queryKey: ["matchings-demande", id],
    queryFn: async () => lire<Matching[]>(await authorizedFetch(`/api/matchings?demande_id=${id}`), "GET /api/matchings"),
  });

  const matchingActif = matchings?.find((m) => ["propose", "accepte", "realise"].includes(m.statut));

  const { data: prestataire } = useQuery({
    queryKey: ["prestataire", matchingActif?.prestataire_id],
    queryFn: async () =>
      lire<Prestataire>(await authorizedFetch(`/api/prestataires/${matchingActif!.prestataire_id}`), "GET /api/prestataires/:id"),
    enabled: Boolean(matchingActif),
  });

  const { data: avisExistant } = useQuery({
    queryKey: ["avis-matching", matchingActif?.id],
    queryFn: async () => {
      const res = await authorizedFetch(`/api/avis?matching_id=${matchingActif!.id}`);
      const rows = await lire<Avis[]>(res, "GET /api/avis");
      return rows[0] ?? null;
    },
    enabled: Boolean(matchingActif && matchingActif.statut === "realise"),
  });

  const annuler = useMutation({
    mutationFn: async () => {
      const res = await authorizedFetch(`/api/demandes/${id}/statut`, {
        method: "PATCH",
        body: JSON.stringify({ statut: "annulee" }),
      });
      if (!res.ok) throw new Error(`Annulation échouée (${res.status})`);
    },
    onSuccess: () => {
      toast.success("Demande annulée");
      void queryClient.invalidateQueries({ queryKey: ["demande", id] });
      void queryClient.invalidateQueries({ queryKey: ["mes-demandes"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erreur"),
  });

  const publierAvis = useMutation({
    mutationFn: async () => {
      const res = await authorizedFetch("/api/avis", {
        method: "POST",
        body: JSON.stringify({ matching_id: matchingActif!.id, note, commentaire: commentaire || null }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null) as { error?: string } | null;
        throw new Error(body?.error || `Publication échouée (${res.status})`);
      }
    },
    onSuccess: () => {
      toast.success("Merci pour votre avis !");
      void queryClient.invalidateQueries({ queryKey: ["avis-matching", matchingActif?.id] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erreur"),
  });

  if (isLoading) return <p className="text-sm text-muted-foreground">Chargement…</p>;
  if (!demande) {
    return (
      <div>
        <p className="text-sm text-muted-foreground">Demande introuvable.</p>
        <Link to="/espace/demandes" className="mt-3 inline-block text-sm text-primary">← Mes demandes</Link>
      </div>
    );
  }

  const libelleCategorie = categories?.find((c) => c.id === demande.categorie_id)?.libelle ?? "—";

  return (
    <div className="max-w-2xl space-y-6">
      <Link to="/espace/demandes" className="text-sm text-muted-foreground hover:text-primary">
        ← Mes demandes
      </Link>

      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="font-display text-xl font-bold text-foreground">{libelleCategorie}</h1>
          <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
            {STATUT_LABEL[demande.statut]}
          </span>
        </div>
        <p className="mt-3 text-sm text-foreground">{demande.description}</p>
        {demande.localisation && (
          <p className="mt-2 text-xs text-muted-foreground">Localisation : {demande.localisation}</p>
        )}
        <p className="mt-1 text-xs text-muted-foreground">
          Envoyée le {new Date(demande.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
        </p>

        {demande.statut === "nouvelle" && (
          <Button variant="outline" size="sm" className="mt-4" onClick={() => annuler.mutate()} disabled={annuler.isPending}>
            Annuler ma demande
          </Button>
        )}
      </div>

      {matchingActif && (
        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="font-display text-lg font-semibold text-foreground">Prestataire assigné</h2>
          <p className="mt-2 text-sm font-semibold text-foreground">{prestataire?.nom ?? "…"}</p>
          <p className="text-xs text-muted-foreground">{MATCHING_LABEL[matchingActif.statut]}</p>

          {matchingActif.statut === "realise" && (
            <div className="mt-4 border-t border-border pt-4">
              {avisExistant ? (
                <div>
                  <p className="text-sm font-semibold text-foreground">Votre avis : {avisExistant.note}/5</p>
                  {avisExistant.commentaire && (
                    <p className="mt-1 text-sm text-muted-foreground">{avisExistant.commentaire}</p>
                  )}
                  {avisExistant.reponse && (
                    <p className="mt-2 rounded-xl bg-muted p-2 text-sm text-muted-foreground">
                      Réponse du prestataire : {avisExistant.reponse}
                    </p>
                  )}
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    publierAvis.mutate();
                  }}
                  className="space-y-3"
                >
                  <p className="text-sm font-semibold text-foreground">Laissez votre avis</p>
                  <div className="space-y-1.5">
                    <Label htmlFor="note">Note</Label>
                    <select
                      id="note"
                      value={note}
                      onChange={(e) => setNote(Number(e.target.value))}
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
                    <Label htmlFor="com">Commentaire</Label>
                    <Textarea id="com" rows={3} value={commentaire} onChange={(e) => setCommentaire(e.target.value)} />
                  </div>
                  <Button type="submit" size="sm" disabled={publierAvis.isPending}>
                    {publierAvis.isPending ? "Envoi…" : "Publier mon avis"}
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
