import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { authorizedFetch } from "@/lib/maideres-core-client";
import { maFichePrestataire, CATEGORIES } from "@/lib/maideres-api";
import { VILLES, quartiersParVille, type Ville } from "@/lib/maidere";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/_authenticated/pro/profil")({
  component: ProfilPro,
});

const STATUT_LABEL: Record<string, string> = {
  en_attente: "En cours de vérification par l'équipe MAIDERES",
  actif: "Visible publiquement",
  suspendu: "Suspendue — contactez le support",
};

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
  const [enregistrement, setEnregistrement] = useState(false);

  const { data } = useQuery({
    queryKey: ["ma-fiche-pro"],
    queryFn: () => maFichePrestataire(),
  });

  useEffect(() => {
    if (!data) return;
    setNom(data.nom);
    setMetier(data.metier ?? CATEGORIES[0]!);
    setBio(data.bio ?? "");
    if (data.ville) setVille(data.ville as Ville);
    setQuartier(data.quartier ?? "");
    setZones(data.zones_couverture.join(", "));
    setTelephone(data.telephone ?? "");
    setDisponible(data.disponible);
  }, [data]);

  async function enregistrer(e: React.FormEvent) {
    e.preventDefault();
    setEnregistrement(true);
    try {
      const zonesCouverture = zones
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const res = data
        ? await authorizedFetch(`/api/prestataires/${data.id}`, {
            method: "PATCH",
            body: JSON.stringify({
              nom, telephone, quartier: quartier || null, ville, metier, bio: bio || null,
              disponible, zones_couverture: zonesCouverture,
            }),
          })
        : await authorizedFetch("/api/prestataires", {
            method: "POST",
            body: JSON.stringify({
              nom, telephone, quartier: quartier || null, ville, metier, bio: bio || null,
              zones_couverture: zonesCouverture,
            }),
          });

      if (!res.ok) {
        const body = await res.json().catch(() => null) as { error?: string } | null;
        throw new Error(body?.error || `Enregistrement échoué (${res.status})`);
      }
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

      {data && (
        <p className="mt-3 inline-block rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
          Statut de la fiche : {STATUT_LABEL[data.statut ?? "en_attente"] ?? data.statut}
        </p>
      )}

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
          <Input id="tel" value={telephone} onChange={(e) => setTelephone(e.target.value)} required minLength={6} />
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={disponible}
            onChange={(e) => setDisponible(e.target.checked)}
          />
          Disponible actuellement
        </label>

        <Button type="submit" disabled={enregistrement}>
          {enregistrement ? "Enregistrement…" : data ? "Enregistrer" : "Créer ma fiche"}
        </Button>
      </form>
    </div>
  );
}
