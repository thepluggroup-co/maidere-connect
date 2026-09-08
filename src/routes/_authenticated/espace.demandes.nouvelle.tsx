import { useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { authorizedFetch } from "@/lib/maideres-core-client";
import { listerCategories, type Demande } from "@/lib/maideres-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/_authenticated/espace/demandes/nouvelle")({
  component: NouvelleDemande,
});

const NIVEAUX = [
  { value: "immediate", label: "Immédiat (sous 2h)" },
  { value: "urgent", label: "Urgent (sous 24h)" },
  { value: "planifie", label: "Planifié" },
] as const;

function NouvelleDemande() {
  const navigate = useNavigate();
  const [categorieId, setCategorieId] = useState("");
  const [description, setDescription] = useState("");
  const [localisation, setLocalisation] = useState("");
  const [niveauUrgence, setNiveauUrgence] = useState<(typeof NIVEAUX)[number]["value"]>("urgent");
  const [dateSouhaitee, setDateSouhaitee] = useState("");

  const { data: categories } = useQuery({ queryKey: ["categories"], queryFn: listerCategories });

  const creer = useMutation({
    mutationFn: async () => {
      if (!categorieId) throw new Error("Choisissez une catégorie de service");
      const res = await authorizedFetch("/api/demandes", {
        method: "POST",
        body: JSON.stringify({
          categorie_id: categorieId,
          description,
          localisation: localisation || null,
          niveau_urgence: niveauUrgence,
          ...(niveauUrgence === "planifie" && dateSouhaitee
            ? { date_souhaitee: new Date(dateSouhaitee).toISOString() }
            : {}),
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null) as { error?: string } | null;
        throw new Error(body?.error || `Création échouée (${res.status})`);
      }
      return ((await res.json()) as { data: Demande }).data;
    },
    onSuccess: (demande) => {
      toast.success("Demande envoyée — un opérateur va la traiter");
      void navigate({ to: "/espace/demandes/$id", params: { id: demande.id } });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erreur"),
  });

  return (
    <div className="max-w-xl">
      <Link to="/espace/demandes" className="text-sm text-muted-foreground hover:text-primary">
        ← Mes demandes
      </Link>
      <h1 className="mt-4 font-display text-2xl font-bold text-foreground">Nouvelle demande</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Décrivez votre besoin — un opérateur MAIDERES vous mettra en relation avec un prestataire vérifié.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          creer.mutate();
        }}
        className="mt-6 space-y-4 rounded-2xl border border-border bg-card p-5"
      >
        <div className="space-y-1.5">
          <Label htmlFor="cat">Catégorie de service</Label>
          <select
            id="cat"
            value={categorieId}
            onChange={(e) => setCategorieId(e.target.value)}
            required
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">Choisir…</option>
            {(categories ?? []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.libelle}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="desc">Décrivez votre besoin</Label>
          <Textarea
            id="desc"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            placeholder="Ex : fuite d'eau sous l'évier de la cuisine, besoin d'une intervention rapide"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="loc">Localisation (quartier, repère)</Label>
          <Input id="loc" value={localisation} onChange={(e) => setLocalisation(e.target.value)} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="urgence">Urgence</Label>
          <select
            id="urgence"
            value={niveauUrgence}
            onChange={(e) => setNiveauUrgence(e.target.value as typeof niveauUrgence)}
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            {NIVEAUX.map((n) => (
              <option key={n.value} value={n.value}>
                {n.label}
              </option>
            ))}
          </select>
        </div>

        {niveauUrgence === "planifie" && (
          <div className="space-y-1.5">
            <Label htmlFor="date">Date souhaitée</Label>
            <Input
              id="date"
              type="datetime-local"
              value={dateSouhaitee}
              onChange={(e) => setDateSouhaitee(e.target.value)}
              required
            />
          </div>
        )}

        <Button type="submit" disabled={creer.isPending} className="w-full">
          {creer.isPending ? "Envoi…" : "Envoyer ma demande"}
        </Button>
      </form>
    </div>
  );
}
