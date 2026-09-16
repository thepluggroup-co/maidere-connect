import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { modifierMonClient, monClient } from "@/lib/maideres-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_authenticated/espace/profil")({
  component: ProfilClient,
});

function ProfilClient() {
  const [nom, setNom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [quartier, setQuartier] = useState("");
  const [enregistrement, setEnregistrement] = useState(false);

  const { data } = useQuery({
    queryKey: ["mon-profil"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return null;
      return { email: u.user.email ?? "", profil: await monClient() };
    },
  });

  useEffect(() => {
    if (!data?.profil) return;
    setNom(data.profil.nom ?? "");
    setTelephone(data.profil.telephone ?? "");
    setQuartier(data.profil.quartier ?? "");
  }, [data]);

  async function enregistrer(e: React.FormEvent) {
    e.preventDefault();
    setEnregistrement(true);
    try {
      if (!data?.profil) throw new Error("Aucune fiche client associée à ce compte");
      await modifierMonClient(data.profil.id, { nom, telephone, quartier: quartier || null });
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
        <div className="space-y-1.5">
          <Label htmlFor="quartier">Quartier</Label>
          <Input id="quartier" value={quartier} onChange={(e) => setQuartier(e.target.value)} />
        </div>
        <Button type="submit" disabled={enregistrement}>
          {enregistrement ? "Enregistrement…" : "Enregistrer"}
        </Button>
      </form>
    </div>
  );
}
