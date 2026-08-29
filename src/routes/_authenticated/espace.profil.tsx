import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { VILLES, quartiersParVille, type Ville } from "@/lib/maidere";

export const Route = createFileRoute("/_authenticated/espace/profil")({
  component: ProfilClient,
});

function ProfilClient() {
  const [nom, setNom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [ville, setVille] = useState<Ville>("Douala");
  const [quartier, setQuartier] = useState("");
  const [enregistrement, setEnregistrement] = useState(false);

  const { data } = useQuery({
    queryKey: ["mon-profil"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return null;
      const { data: p } = await supabase
        .from("profiles")
        .select("nom_complet, telephone, ville, quartier")
        .eq("id", u.user.id)
        .maybeSingle();
      return { email: u.user.email ?? "", profil: p };
    },
  });

  useEffect(() => {
    if (!data?.profil) return;
    setNom(data.profil.nom_complet ?? "");
    setTelephone(data.profil.telephone ?? "");
    if (data.profil.ville) setVille(data.profil.ville as Ville);
    setQuartier(data.profil.quartier ?? "");
  }, [data]);

  async function enregistrer(e: React.FormEvent) {
    e.preventDefault();
    setEnregistrement(true);
    try {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) throw new Error("Session expirée");
      const { error } = await supabase
        .from("profiles")
        .update({ nom_complet: nom, telephone, ville, quartier })
        .eq("id", u.user.id);
      if (error) throw error;
      toast.success("Profil enregistré");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur");
    } finally {
      setEnregistrement(false);
    }
  }

  return (
    <div className="max-w-xl">
      <h1 className="font-display text-2xl font-bold text-foreground">Mon profil</h1>
      <p className="mt-1 text-sm text-muted-foreground">{data?.email}</p>

      <form onSubmit={enregistrer} className="mt-6 space-y-4 rounded-2xl border border-border bg-card p-5">
        <div className="space-y-1.5">
          <Label htmlFor="nom">Nom complet</Label>
          <Input id="nom" value={nom} onChange={(e) => setNom(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="tel">Téléphone</Label>
          <Input id="tel" value={telephone} onChange={(e) => setTelephone(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
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
        <Button type="submit" disabled={enregistrement}>
          {enregistrement ? "Enregistrement…" : "Enregistrer"}
        </Button>
      </form>
    </div>
  );
}
