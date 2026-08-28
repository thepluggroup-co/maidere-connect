import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { listerPrestataires, CATEGORIES } from "@/lib/maideres-api";
import { VILLES, quartiersParVille, type Ville } from "@/lib/maidere";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/_authenticated/espace/recherche")({
  component: RechercheClient,
});

function RechercheClient() {
  const [ville, setVille] = useState<Ville | "">("");
  const [quartier, setQuartier] = useState("");
  const [categorie, setCategorie] = useState("");
  const [recherche, setRecherche] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["recherche-client", ville, quartier, categorie, recherche],
    queryFn: () => listerPrestataires({ ville, quartier, categorie, recherche }),
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-foreground">Rechercher un prestataire</h1>

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
          disabled={!ville}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
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
          value={categorie}
          onChange={(e) => setCategorie(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">Tous les métiers</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
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
        <p className="mt-6 text-sm text-muted-foreground">Chargement…</p>
      ) : (data?.length ?? 0) === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">Aucun résultat.</p>
      ) : (
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {data!.map((p) => (
            <Link
              key={p.id}
              to="/prestataires/$id"
              params={{ id: p.id }}
              className="rounded-2xl border border-border bg-card p-4 hover:shadow-md"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="font-semibold text-foreground">{p.nom_affichage}</p>
                {p.verifie && <span className="text-xs text-secondary">Vérifié</span>}
              </div>
              <p className="text-sm text-primary">{p.metier}</p>
              <p className="text-xs text-muted-foreground">
                {p.quartier ? `${p.quartier}, ` : ""}
                {p.ville}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
