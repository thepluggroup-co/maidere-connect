import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { chargerFichePrestataire, moyenne } from "@/lib/maideres-api";
import { xof } from "@/lib/maidere";

export const Route = createFileRoute("/prestataires/$id")({
  head: () => ({
    meta: [
      { title: "Fiche prestataire — MAIDERES" },
      {
        name: "description",
        content:
          "Offres, tarifs en FCFA, galerie de réalisations, promotions et avis clients du prestataire MAIDERES.",
      },
      { property: "og:title", content: "Fiche prestataire — MAIDERES" },
      { property: "og:description", content: "Offres, galerie, promotions et avis vérifiés." },
    ],
  }),
  component: FichePrestataire,
});

function FichePrestataire() {
  const { id } = Route.useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["fiche-prestataire", id],
    queryFn: () => chargerFichePrestataire(id),
  });

  if (isLoading) {
    return <p className="p-10 text-sm text-muted-foreground">Chargement…</p>;
  }
  if (!data?.prestataire) {
    return (
      <div className="p-10">
        <p className="text-sm text-muted-foreground">Ce prestataire n'est pas disponible.</p>
        <Link to="/prestataires" className="mt-4 inline-block text-sm text-primary">
          ← Retour à la recherche
        </Link>
      </div>
    );
  }

  const p = data.prestataire;
  const note = moyenne(data.avis);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <Link to="/prestataires" className="text-sm text-muted-foreground hover:text-primary">
          ← Retour à la recherche
        </Link>

        <header className="mt-4 rounded-3xl border border-border bg-card p-6">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-2xl font-bold text-foreground">{p.nom_affichage}</h1>
            {p.verifie && (
              <span className="rounded-full bg-secondary/10 px-2 py-0.5 text-xs font-semibold text-secondary">
                Vérifié
              </span>
            )}
            {p.disponible && (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                Disponible
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-primary">{p.metier}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {p.quartier ? `${p.quartier}, ` : ""}
            {p.ville}
            {data.avis.length > 0 && ` · ${note.toFixed(1)}/5 (${data.avis.length} avis)`}
          </p>
          {p.bio && <p className="mt-4 text-sm text-muted-foreground">{p.bio}</p>}
        </header>

        {data.promotions.length > 0 && (
          <section className="mt-8">
            <h2 className="font-display text-lg font-semibold text-foreground">Promotions</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {data.promotions.map((promo) => (
                <div key={promo.id} className="rounded-2xl border border-secondary/40 bg-card p-4">
                  <p className="font-semibold text-secondary">
                    −{promo.remise_pct}% · {promo.titre}
                  </p>
                  {promo.description && (
                    <p className="mt-1 text-sm text-muted-foreground">{promo.description}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="mt-8">
          <h2 className="font-display text-lg font-semibold text-foreground">Prestations</h2>
          {data.offres.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">Aucune offre publiée.</p>
          ) : (
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {data.offres.map((o) => (
                <div key={o.id} className="rounded-2xl border border-border bg-card p-4">
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="font-semibold text-foreground">{o.titre}</h3>
                    <span className="whitespace-nowrap text-sm font-semibold text-primary">
                      {xof(o.prix)} / {o.unite_prix}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {o.categorie} · délai {o.delai_heures} h
                  </p>
                  {o.description && (
                    <p className="mt-2 text-sm text-muted-foreground">{o.description}</p>
                  )}
                  {o.prestations.length > 0 && (
                    <ul className="mt-2 list-inside list-disc text-sm text-muted-foreground">
                      {o.prestations.map((pr) => (
                        <li key={pr}>{pr}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {data.realisations.length > 0 && (
          <section className="mt-8">
            <h2 className="font-display text-lg font-semibold text-foreground">Réalisations</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {data.realisations.map((r) => (
                <figure key={r.id} className="overflow-hidden rounded-2xl border border-border">
                  <img
                    src={r.image_url}
                    alt={r.titre}
                    loading="lazy"
                    className="h-40 w-full object-cover"
                  />
                  <figcaption className="bg-card p-2 text-xs text-muted-foreground">
                    {r.titre}
                  </figcaption>
                </figure>
              ))}
            </div>
          </section>
        )}

        <section className="mt-8">
          <h2 className="font-display text-lg font-semibold text-foreground">Avis clients</h2>
          {data.avis.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">Aucun avis pour l'instant.</p>
          ) : (
            <ul className="mt-3 space-y-3">
              {data.avis.map((a) => (
                <li key={a.id} className="rounded-2xl border border-border bg-card p-4">
                  <p className="text-sm font-semibold text-foreground">{a.note}/5</p>
                  {a.commentaire && (
                    <p className="mt-1 text-sm text-muted-foreground">{a.commentaire}</p>
                  )}
                  {a.reponse && (
                    <p className="mt-2 rounded-xl bg-muted p-2 text-sm text-muted-foreground">
                      Réponse du prestataire : {a.reponse}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="mt-10 rounded-3xl border border-border bg-card p-6 text-center">
          <p className="text-sm text-muted-foreground">
            Créez votre compte client pour laisser un avis et suivre vos prestataires favoris.
          </p>
          <Link
            to="/auth/client"
            className="mt-3 inline-flex rounded-full bg-secondary px-5 py-2 text-sm font-semibold text-secondary-foreground"
          >
            Espace client
          </Link>
        </div>
      </div>
    </div>
  );
}
