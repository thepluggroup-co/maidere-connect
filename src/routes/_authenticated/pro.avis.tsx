import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { authorizedFetch } from "@/lib/maideres-core-client";
import { moyenne, type Avis } from "@/lib/maideres-api";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/pro/avis")({
  component: AvisPro,
});

function AvisPro() {
  const queryClient = useQueryClient();

  // GET /api/avis, sans filtre, se limite automatiquement aux avis liés aux
  // matchings du prestataire authentifié (cf. apps/api/src/routes/avis.ts) —
  // aucun paramètre prestataire_id à passer ici.
  const { data: avis } = useQuery({
    queryKey: ["avis-recus"],
    queryFn: async () => {
      const res = await authorizedFetch("/api/avis");
      return ((await res.json()) as { data: Avis[] }).data;
    },
  });

  const repondre = useMutation({
    mutationFn: async (a: Avis) => {
      const reponse = window.prompt("Votre réponse publique", a.reponse ?? "");
      if (reponse === null) return;
      const res = await authorizedFetch(`/api/avis/${a.id}`, {
        method: "PATCH",
        body: JSON.stringify({ reponse: reponse || null }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null) as { error?: string } | null;
        throw new Error(body?.error || `Réponse échouée (${res.status})`);
      }
    },
    onSuccess: () => {
      toast.success("Réponse enregistrée");
      void queryClient.invalidateQueries({ queryKey: ["avis-recus"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erreur"),
  });

  const liste = avis ?? [];

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-foreground">Avis reçus</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {liste.length > 0
          ? `Note moyenne ${moyenne(liste).toFixed(1)}/5 sur ${liste.length} avis`
          : "Aucun avis pour le moment."}
      </p>

      <ul className="mt-6 space-y-3">
        {liste.map((a) => (
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
