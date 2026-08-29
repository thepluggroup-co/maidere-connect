import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { maFichePrestataire, CATEGORIES } from "@/lib/maideres-api";
import { VILLES, quartiersParVille, type Ville } from "@/lib/maidere";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/_authenticated/pro/profil")({
  component: ProfilPro,
});

function ProfilPro() {
  const queryClient = useQueryClient();
  const [nom, setNom] = useState("");
  const [metier, setMetier] = useState(CATEGORIES[0]!);
  const [bio, setBio] = useState("");
  const [ville, setVille] = useState<Ville>("Douala");
  const [quartier, setQuartier] = useState("");
  const [zones, setZones] = useState("");
  const [telephone, setTelephone] = useState("");
  const [disponible, setDisponible] = useState(true);
  const [publie, setPublie] = useState(true);
  const [enregistrement, setEnregistrement] = useState(false);

  const { data } = useQuery({
    queryKey: ["ma-fiche-pro"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return null;
      const fiche = await maFichePrestataire(u.user.id);
      return { userId: u.user.id, fiche };
    },
  });

  useEffect(() => {
    const f = data?.fiche;
    if (!f) return;
    setNom(f.nom_affichage);
    setMetier(f.metier);
    setBio(f.bio ?? "");
    setVille(f.ville as Ville);
    setQuartier(f.quartier ?? "");
    setZones(f.zones_couverture.join(", "));
    setTelephone(f.telephone ?? "");
    setDisponible(f.disponible);
    setPublie(f.publie);
  }, [data]);

  async function enregistrer(e: React.FormEvent) {
    e.preventDefault();
    if (!data?.userId) return;
    setEnregistrement(true);
    try {
      const valeurs = {
        user_id: data.userId,
        nom_affichage: nom,
        metier,
        categorie: metier,
        bio: bio || null,
        ville,
        quartier: quartier || null,
        zones_couverture: zones
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        telephone: telephone || null,
        disponible,
        publie,
      };
      const { error } = data.fiche
        ? await supabase.from("prestataires").update(valeurs).eq("id", data.fiche.id)
        : await supabase.from("prestataires").insert(valeurs);
      if (error) throw error;
      toast.success("Fiche enregistrée");
      void queryClient.invalidateQueries({ queryKey: ["ma-fiche-pro"] });
      void queryClient.invalidateQueries({ queryKey: ["tableau-pro"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur");
    } finally {
      setEnregistrement(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-2xl font-bold text-foreground">Profil professionnel</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Ces informations apparaissent sur votre fiche publique et dans la recherche client.
      </p>

      <form onSubmit={enregistrer} className="mt-6 space-y-4 rounded-2xl border border-border bg-card p-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="nom">Nom affiché</Label>
            <Input id="nom" value={nom} onChange={(e) => setNom(e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="metier">Métier</Label>
            <select
              id="metier"
              value={metier}
              onChange={(e) => setMetier(e.target.value)}
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
          <Label htmlFor="bio">Présentation</Label>
          <Textarea id="bio" rows={4} value={bio} onChange={(e) => setBio(e.target.value)} />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="ville">Ville</Label>
            <select
              id="ville"
              value={ville}
              onChange={(e) => {
                setVille(e.target.value as Ville);
                setQuartier("");
              }}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              {VILLES.map((v) => (
                <option key={v.nom} value={v.nom}>
                  {v.nom}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="quartier">Quartier</Label>
            <select
              id="quartier"
              value={quartier}
              onChange={(e) => setQuartier(e.target.value)}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">—</option>
              {quartiersParVille(ville).map((q) => (
                <option key={q} value={q}>
                  {q}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="zones">Zones couvertes (séparées par des virgules)</Label>
          <Input id="zones" value={zones} onChange={(e) => setZones(e.target.value)} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="tel">Téléphone</Label>
          <Input id="tel" value={telephone} onChange={(e) => setTelephone(e.target.value)} />
        </div>

        <div className="flex flex-wrap gap-6 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={disponible}
              onChange={(e) => setDisponible(e.target.checked)}
            />
            Disponible actuellement
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={publie} onChange={(e) => setPublie(e.target.checked)} />
            Fiche visible publiquement
          </label>
        </div>

        <Button type="submit" disabled={enregistrement}>
          {enregistrement ? "Enregistrement…" : data?.fiche ? "Enregistrer" : "Créer ma fiche"}
        </Button>
      </form>
    </div>
  );
}
