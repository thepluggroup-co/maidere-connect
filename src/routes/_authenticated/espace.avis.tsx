import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { listerPrestataires } from "@/lib/maideres-api";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/_authenticated/espace/avis")({
  component: AvisClient,
});

function AvisClient() {
  const queryClient = useQueryClient();
  const [prestataireId, setPrestataireId] = useState("");
  const [note, setNote] = useState(5);
  const [commentaire, setCommentaire] = useState("");

  const { data: prestataires } = useQuery({
    queryKey: ["prestataires-pour-avis"],
    queryFn: () => listerPrestataires({}),
  });

  const { data: mesAvis } = useQuery({
    queryKey: ["mes-avis"],
    queryFn: async () => {
      const { data: session } = await supabase.auth.getUser();
      const uid = session.user?.id;
      if (!uid) return [];
      const { data } = await supabase
        .from("avis")
        .select("id, note, commentaire, reponse, prestataire_id, created_at")
        .eq("client_id", uid)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const publier = useMutation({
    mutationFn: async () => {
      const { data: session } = await supabase.auth.getUser();
      const uid = session.user?.id;
      if (!uid) throw new Error("Session expirée");
      if (!prestataireId) throw new Error("Choisissez un prestataire");
      const { error } = await supabase.from("avis").insert({
        client_id: uid,
        prestataire_id: prestataireId,
        note,
        commentaire: commentaire || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Avis publié");
      setCommentaire("");
      void queryClient.invalidateQueries({ queryKey: ["mes-avis"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erreur"),
  });

  const nomDe = (id: string) => prestataires?.find((p) => p.id === id)?.nom_affichage ?? "Prestataire";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Mes avis</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Partagez votre expérience pour aider la communauté MAIDERES.
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          publier.mutate();
        }}
        className="space-y-4 rounded-2xl border border-border bg-card p-5"
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="prest">Prestataire</Label>
            <select
              id="prest"
              value={prestataireId}
              onChange={(e) => setPrestataireId(e.target.value)}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">Choisir…</option>
              {(prestataires ?? []).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nom_affichage} — {p.metier}
                </option>
              ))}
            </select>
          </div>
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
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="com">Commentaire</Label>
          <Textarea
            id="com"
            value={commentaire}
            onChange={(e) => setCommentaire(e.target.value)}
            rows={3}
          />
        </div>
        <Button type="submit" disabled={publier.isPending}>
          {publier.isPending ? "Envoi…" : "Publier mon avis"}
        </Button>
      </form>

      <section>
        <h2 className="font-display text-lg font-semibold text-foreground">Avis publiés</h2>
        {(mesAvis?.length ?? 0) === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">Vous n'avez pas encore publié d'avis.</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {mesAvis!.map((a) => (
              <li key={a.id} className="rounded-2xl border border-border bg-card p-4">
                <p className="text-sm font-semibold text-foreground">
                  {nomDe(a.prestataire_id)} · {a.note}/5
                </p>
                {a.commentaire && (
                  <p className="mt-1 text-sm text-muted-foreground">{a.commentaire}</p>
                )}
                {a.reponse && (
                  <p className="mt-2 rounded-xl bg-muted p-2 text-sm text-muted-foreground">
                    Réponse : {a.reponse}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
