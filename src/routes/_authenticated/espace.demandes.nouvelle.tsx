import { useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { toast } from "sonner";
import { authorizedFetch } from "@/lib/maideres-core-client";
import { listerCategories, chargerFichePrestataire, type Demande } from "@/lib/maideres-api";
import { xof } from "@/lib/maidere";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/_authenticated/espace/demandes/nouvelle")({
  validateSearch: z.object({
    offre_id: z.string().uuid().optional(),
    prestataire_id: z.string().uuid().optional(),
  }),
  component: NouvelleDemande,
});

const NIVEAUX = [
  { value: "immediate", label: "Immédiat (sous 2h)" },
  { value: "urgent", label: "Urgent (sous 24h)" },
  { value: "planifie", label: "Planifié" },
] as const;

function NouvelleDemande() {
  const navigate = useNavigate();
  const { offre_id: offreId, prestataire_id: prestataireId } = Route.useSearch();
  const [categorieId, setCategorieId] = useState("");
  const [description, setDescription] = useState("");
  const [localisation, setLocalisation] = useState("");
  const [niveauUrgence, setNiveauUrgence] = useState<(typeof NIVEAUX)[number]["value"]>("urgent");
  const [dateSouhaitee, setDateSouhaitee] = useState("");
  const [descriptionPreremplie, setDescriptionPreremplie] = useState(false);

  const { data: categories } = useQuery({ queryKey: ["categories"], queryFn: listerCategories });

  // Venu de "Demander cette offre" sur une fiche prestataire : pas d'API
  // dédiée pour une offre isolée, donc on réutilise le même paquet public
  // que la fiche (déjà accessible sans auth) et on retrouve l'offre dedans.
  const { data: fiche } = useQuery({
    queryKey: ["fiche-prestataire", prestataireId],
    queryFn: () => chargerFichePrestataire(prestataireId!),
    enabled: Boolean(prestataireId && offreId),
  });
  const offre = fiche?.offres.find((o) => o.id === offreId);

  // Pré-remplissage une seule fois quand l'offre et la liste des catégories
  // sont disponibles — sans bloquer la saisie si le client modifie ensuite.
  if (offre && categories && !categorieId && !descriptionPreremplie) {
    const categorieCorrespondante = categories.find(
      (c) => c.libelle.toLowerCase() === offre.categorie.toLowerCase(),
    );
    if (categorieCorrespondante) setCategorieId(categorieCorrespondante.id);
    setDescription(`${offre.titre}${offre.description ? ` — ${offre.description}` : ""}`);
    setDescriptionPreremplie(true);
  }

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
          ...(offre ? { offre_id: offre.id } : {}),
          ...(niveauUrgence === "planifie" && dateSouhaitee
            ? { date_souhaitee: new Date(dateSouhaitee).toISOString() }
            : {}),
        }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error || `Création échouée (${res.status})`);
      }
      return ((await res.json()) as { data: Demande }).data;
    },
    onSuccess: (demande) => {
      toast.success(
        offre
          ? "Demande envoyée — le prestataire va l'examiner"
          : "Demande envoyée — un opérateur va la traiter",
      );
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
        {offre
          ? "Cette demande sera envoyée directement au prestataire de l'offre choisie."
          : "Décrivez votre besoin — un opérateur MAIDERES vous mettra en relation avec un prestataire vérifié."}
      </p>

      {offreId && !offre && (
        <p className="mt-3 rounded-xl bg-muted px-3 py-2 text-xs text-muted-foreground">
          Chargement de l&apos;offre sélectionnée…
        </p>
      )}
      {offre && (
        <div className="mt-4 rounded-2xl border border-primary/30 bg-primary/5 p-4">
          <p className="text-sm font-semibold text-foreground">{offre.titre}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {offre.categorie} · {xof(offre.prix)} / {offre.unite_prix}
          </p>
        </div>
      )}

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
