import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { listerPrestataires, listerCategoriesPubliques } from "@/lib/maideres-api";
import { VILLES, quartiersParVille, type Ville } from "@/lib/maidere";
import { Input } from "@/components/ui/input";
import { ProviderCard } from "@/components/maideres/ProviderCard";

export const Route = createFileRoute("/prestataires/")({
  head: () => ({
    meta: [
      { title: "Trouver un prestataire vérifié — MAIDERES" },
      {
        name: "description",
        content:
          "Recherchez un prestataire vérifié à Douala, Yaoundé ou Abidjan : plomberie, bricolage, restauration, transport, couture et plus.",
      },
      { property: "og:title", content: "Trouver un prestataire vérifié — MAIDERES" },
      {
        property: "og:description",
        content: "Recherche par ville, quartier et catégorie de service.",
      },
    ],
  }),
  component: RecherchePublique,
});

function RecherchePublique() {
  const navigate = useNavigate();
  const [ville, setVille] = useState<Ville | "">("");
  const [quartier, setQuartier] = useState("");
  const [categorieId, setCategorieId] = useState("");
  const [recherche, setRecherche] = useState("");

  const { data: categories } = useQuery({
    queryKey: ["categories-publiques"],
    queryFn: listerCategoriesPubliques,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["prestataires", ville, quartier, categorieId, recherche],
    queryFn: () => listerPrestataires({ ville, quartier, categorieId, recherche }),
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <Link to="/" className="text-sm text-muted-foreground hover:text-primary">
          ← Accueil
        </Link>
        <h1 className="mt-4 font-display text-3xl font-bold text-foreground">
          Prestataires vérifiés
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Douala, Yaoundé et Abidjan — filtrez par ville, quartier et métier.
        </p>

        <div className="mt-6 grid gap-3 rounded-2xl border border-border bg-card p-4 sm:grid-cols-4">
          <select
            value={ville}
            onChange={(e) => {
              setVille(e.target.value as Ville | "");
              setQuartier("");
            }}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">Toutes les villes</option>
            {VILLES.map((v) => (
              <option key={v.nom} value={v.nom}>
                {v.nom}
              </option>
            ))}
          </select>
          <select
            value={quartier}
            onChange={(e) => setQuartier(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
            disabled={!ville}
          >
            <option value="">Tous les quartiers</option>
            {ville &&
              quartiersParVille(ville).map((q) => (
                <option key={q} value={q}>
                  {q}
                </option>
              ))}
          </select>
          <select
            value={categorieId}
            onChange={(e) => setCategorieId(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">Tous les métiers</option>
            {(categories ?? []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.libelle}
              </option>
            ))}
          </select>
          <Input
            placeholder="Nom du prestataire"
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
          />
        </div>

        {isLoading ? (
          <p className="mt-8 text-sm text-muted-foreground">Chargement…</p>
        ) : (data?.length ?? 0) === 0 ? (
          <p className="mt-8 text-sm text-muted-foreground">
            Aucun prestataire ne correspond à cette recherche pour le moment.
          </p>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data!.map((p, i) => (
              <ProviderCard
                key={p.id}
                prestataire={p}
                recommande={i === 0}
                onVoirFiche={(id) => navigate({ to: "/prestataires/$id", params: { id } })}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
