import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { maFichePrestataire, CATEGORIES, type Offre } from "@/lib/maideres-api";
import { xof } from "@/lib/maidere";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/_authenticated/pro/offres")({
  component: OffresPro,
});

function OffresPro() {
  const queryClient = useQueryClient();
  const [titre, setTitre] = useState("");
  const [categorie, setCategorie] = useState(CATEGORIES[0]!);
  const [description, setDescription] = useState("");
  const [prestations, setPrestations] = useState("");
  const [prix, setPrix] = useState(10000);
  const [unite, setUnite] = useState("forfait");
  const [delai, setDelai] = useState(24);

  const { data } = useQuery({
    queryKey: ["mes-offres"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return null;
      const fiche = await maFichePrestataire(u.user.id);
      if (!fiche) return { fiche: null, offres: [] as Offre[], promos: [] as any[] };
      const [offres, promos] = await Promise.all([
        supabase
          .from("offres")
          .select("*")
          .eq("prestataire_id", fiche.id)
          .order("created_at", { ascending: false }),
        supabase.from("promotions").select("*").eq("prestataire_id", fiche.id),
      ]);
      return {
        fiche,
        offres: (offres.data ?? []) as unknown as Offre[],
        promos: promos.data ?? [],
      };
    },
  });

  const creer = useMutation({
    mutationFn: async () => {
      if (!data?.fiche) throw new Error("Créez d'abord votre fiche dans « Profil pro »");
      const { error } = await supabase.from("offres").insert({
        prestataire_id: data.fiche.id,
        user_id: data.fiche.user_id,
        titre,
        categorie,
        description: description || null,
        prestations: prestations
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        prix,
        unite_prix: unite,
        delai_heures: delai,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Offre publiée");
      setTitre("");
      setDescription("");
      setPrestations("");
      void queryClient.invalidateQueries({ queryKey: ["mes-offres"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erreur"),
  });

  const supprimer = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("offres").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Offre supprimée");
      void queryClient.invalidateQueries({ queryKey: ["mes-offres"] });
    },
  });

  const basculer = useMutation({
    mutationFn: async ({ id, publie }: { id: string; publie: boolean }) => {
      const { error } = await supabase.from("offres").update({ publie }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["mes-offres"] }),
  });

  const creerPromo = useMutation({
    mutationFn: async (offre: Offre) => {
      const remise = Number(window.prompt("Remise en % (1-90)", "10"));
      if (!remise || remise < 1 || remise > 90) throw new Error("Remise invalide");
      const { error } = await supabase.from("promotions").insert({
        prestataire_id: offre.prestataire_id,
        user_id: offre.user_id,
        offre_id: offre.id,
        titre: `${offre.titre} en promo`,
        remise_pct: remise,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Promotion créée");
      void queryClient.invalidateQueries({ queryKey: ["mes-offres"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erreur"),
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Mes offres</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Décrivez vos prestations, vos tarifs en FCFA et vos délais d'intervention.
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          creer.mutate();
        }}
        className="space-y-4 rounded-2xl border border-border bg-card p-5"
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="titre">Titre de l'offre</Label>
            <Input id="titre" value={titre} onChange={(e) => setTitre(e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cat">Catégorie</Label>
            <select
              id="cat"
              value={categorie}
              onChange={(e) => setCategorie(e.target.value)}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="desc">Description</Label>
          <Textarea
            id="desc"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="prest">Prestations incluses (séparées par des virgules)</Label>
          <Input
            id="prest"
            value={prestations}
            onChange={(e) => setPrestations(e.target.value)}
            placeholder="Diagnostic, réparation, nettoyage"
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="prix">Prix (FCFA)</Label>
            <Input
              id="prix"
              type="number"
              min={0}
              value={prix}
              onChange={(e) => setPrix(Number(e.target.value))}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="unite">Unité</Label>
            <select
              id="unite"
              value={unite}
              onChange={(e) => setUnite(e.target.value)}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="forfait">forfait</option>
              <option value="heure">heure</option>
              <option value="jour">jour</option>
              <option value="m²">m²</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="delai">Délai (heures)</Label>
            <Input
              id="delai"
              type="number"
              min={1}
              value={delai}
              onChange={(e) => setDelai(Number(e.target.value))}
            />
          </div>
        </div>
        <Button type="submit" disabled={creer.isPending}>
          {creer.isPending ? "Publication…" : "Publier l'offre"}
        </Button>
      </form>

      <section>
        <h2 className="font-display text-lg font-semibold text-foreground">Offres publiées</h2>
        {(data?.offres.length ?? 0) === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">Aucune offre pour le moment.</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {data!.offres.map((o) => (
              <li key={o.id} className="rounded-2xl border border-border bg-card p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div>
                    <p className="font-semibold text-foreground">{o.titre}</p>
                    <p className="text-xs text-muted-foreground">
                      {o.categorie} · {xof(o.prix)} / {o.unite_prix} · {o.delai_heures} h
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => basculer.mutate({ id: o.id, publie: !o.publie })}
                    >
                      {o.publie ? "Dépublier" : "Publier"}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => creerPromo.mutate(o)}>
                      Promotion
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => supprimer.mutate(o.id)}>
                      Supprimer
                    </Button>
                  </div>
                </div>
                {o.description && (
                  <p className="mt-2 text-sm text-muted-foreground">{o.description}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
