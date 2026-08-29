import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { maFichePrestataire, moyenne, type Avis } from "@/lib/maideres-api";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/pro/avis")({
  component: AvisPro,
});

function AvisPro() {
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ["avis-recus"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return null;
      const fiche = await maFichePrestataire(u.user.id);
      if (!fiche) return { avis: [] as Avis[] };
      const { data: a } = await supabase
        .from("avis")
        .select("*")
        .eq("prestataire_id", fiche.id)
        .order("created_at", { ascending: false });
      return { avis: (a ?? []) as unknown as Avis[] };
    },
  });

  const repondre = useMutation({
    mutationFn: async (avis: Avis) => {
      const reponse = window.prompt("Votre réponse publique", avis.reponse ?? "");
      if (reponse === null) return;
      const { error } = await supabase.from("avis").update({ reponse }).eq("id", avis.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Réponse enregistrée");
      void queryClient.invalidateQueries({ queryKey: ["avis-recus"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erreur"),
  });

  const avis = data?.avis ?? [];

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-foreground">Avis reçus</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {avis.length > 0
          ? `Note moyenne ${moyenne(avis).toFixed(1)}/5 sur ${avis.length} avis`
          : "Aucun avis pour le moment."}
      </p>

      <ul className="mt-6 space-y-3">
        {avis.map((a) => (
          <li key={a.id} className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-foreground">{a.note}/5</p>
              <Button variant="outline" size="sm" onClick={() => repondre.mutate(a)}>
                {a.reponse ? "Modifier ma réponse" : "Répondre"}
              </Button>
            </div>
            {a.commentaire && <p className="mt-2 text-sm text-muted-foreground">{a.commentaire}</p>}
            {a.reponse && (
              <p className="mt-2 rounded-xl bg-muted p-2 text-sm text-muted-foreground">
                Votre réponse : {a.reponse}
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
