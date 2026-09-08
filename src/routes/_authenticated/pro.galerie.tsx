import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { authorizedFetch } from "@/lib/maideres-core-client";
import { maFichePrestataire, type Realisation } from "@/lib/maideres-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_authenticated/pro/galerie")({
  component: GaleriePro,
});

async function verifierOk(res: Response, contexte: string) {
  if (!res.ok) {
    const body = await res.json().catch(() => null) as { error?: string } | null;
    throw new Error(body?.error || `${contexte} a échoué (${res.status})`);
  }
}

function GaleriePro() {
  const queryClient = useQueryClient();
  const [titre, setTitre] = useState("");
  const [fichier, setFichier] = useState<File | null>(null);
  const [envoi, setEnvoi] = useState(false);

  const { data } = useQuery({
    queryKey: ["ma-galerie"],
    queryFn: async () => {
      const fiche = await maFichePrestataire();
      if (!fiche) return { fiche: null, realisations: [] as Realisation[] };
      const res = await authorizedFetch("/api/realisations");
      const body = (await res.json()) as { data: Realisation[] };
      return { fiche, realisations: body.data };
    },
  });

  const supprimer = useMutation({
    mutationFn: async (id: string) => {
      const res = await authorizedFetch(`/api/realisations/${id}`, { method: "DELETE" });
      await verifierOk(res, "Suppression de la photo");
    },
    onSuccess: () => {
      toast.success("Photo supprimée");
      void queryClient.invalidateQueries({ queryKey: ["ma-galerie"] });
    },
  });

  async function televerser(e: React.FormEvent) {
    e.preventDefault();
    if (!fichier) return;
    setEnvoi(true);
    try {
      if (!data?.fiche) throw new Error("Créez d'abord votre fiche dans « Profil pro »");
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) throw new Error("Session expirée — reconnectez-vous");

      // L'upload lui-même reste un appel Storage direct (bucket "maideres",
      // public en lecture, écriture restreinte au dossier de l'utilisateur —
      // cf. packages/db/drizzle/0028_offres_promotions_realisations_rls.sql) ;
      // seule la ligne de métadonnées passe par l'API MAIDERES.
      const chemin = `${u.user.id}/${Date.now()}-${fichier.name}`;
      const { error: up } = await supabase.storage.from("maideres").upload(chemin, fichier);
      if (up) throw up;
      const { data: publique } = supabase.storage.from("maideres").getPublicUrl(chemin);

      const res = await authorizedFetch("/api/realisations", {
        method: "POST",
        body: JSON.stringify({
          titre: titre || "Réalisation",
          image_url: publique.publicUrl,
        }),
      });
      await verifierOk(res, "Enregistrement de la photo");

      toast.success("Photo ajoutée");
      setTitre("");
      setFichier(null);
      void queryClient.invalidateQueries({ queryKey: ["ma-galerie"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur");
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Galerie de réalisations</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Montrez vos chantiers et travaux terminés pour rassurer vos futurs clients.
        </p>
      </div>

      <form onSubmit={televerser} className="space-y-4 rounded-2xl border border-border bg-card p-5">
        <div className="space-y-1.5">
          <Label htmlFor="titre">Titre</Label>
          <Input id="titre" value={titre} onChange={(e) => setTitre(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="img">Photo</Label>
          <Input
            id="img"
            type="file"
            accept="image/*"
            onChange={(e) => setFichier(e.target.files?.[0] ?? null)}
          />
        </div>
        <Button type="submit" disabled={!fichier || envoi}>
          {envoi ? "Envoi…" : "Ajouter la photo"}
        </Button>
      </form>

      {(data?.realisations.length ?? 0) === 0 ? (
        <p className="text-sm text-muted-foreground">Aucune réalisation publiée.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-3">
          {data!.realisations.map((r) => (
            <figure key={r.id} className="overflow-hidden rounded-2xl border border-border bg-card">
              <img src={r.image_url} alt={r.titre ?? ""} loading="lazy" className="h-40 w-full object-cover" />
              <figcaption className="flex items-center justify-between gap-2 p-2 text-xs text-muted-foreground">
                {r.titre}
                <button
                  type="button"
                  onClick={() => supprimer.mutate(r.id)}
                  className="text-destructive hover:underline"
                >
                  Supprimer
                </button>
              </figcaption>
            </figure>
          ))}
        </div>
      )}
    </div>
  );
}
