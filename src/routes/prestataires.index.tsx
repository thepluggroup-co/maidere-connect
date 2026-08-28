import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { listerPrestataires, CATEGORIES } from "@/lib/maideres-api";
import { VILLES, quartiersParVille, type Ville } from "@/lib/maidere";
import { Input } from "@/components/ui/input";

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
  const [ville, setVille] = useState<Ville | "">("");
  const [quartier, setQuartier] = useState("");
  const [categorie, setCategorie] = useState("");
  const [recherche, setRecherche] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["prestataires", ville, quartier, categorie, recherche],
    queryFn: () => listerPrestataires({ ville, quartier, categorie, recherche }),
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
          <p className="mt-8 text-sm text-muted-foreground">Chargement…</p>
        ) : (data?.length ?? 0) === 0 ? (
          <p className="mt-8 text-sm text-muted-foreground">
            Aucun prestataire ne correspond à cette recherche pour le moment.
          </p>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data!.map((p) => (
              <Link
                key={p.id}
                to="/prestataires/$id"
                params={{ id: p.id }}
                className="rounded-2xl border border-border bg-card p-5 transition-shadow hover:shadow-md"
              >
                <div className="flex items-center justify-between gap-2">
                  <h2 className="font-display font-semibold text-foreground">{p.nom_affichage}</h2>
                  {p.verifie && (
                    <span className="rounded-full bg-secondary/10 px-2 py-0.5 text-xs font-semibold text-secondary">
                      Vérifié
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-primary">{p.metier}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {p.quartier ? `${p.quartier}, ` : ""}
                  {p.ville}
                </p>
                {p.bio && (
                  <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">{p.bio}</p>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
