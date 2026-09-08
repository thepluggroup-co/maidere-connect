import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { authorizedFetch } from "@/lib/maideres-core-client";
import type { Avis, Matching, Prestataire } from "@/lib/maideres-api";

export const Route = createFileRoute("/_authenticated/espace/avis")({
  component: AvisClient,
});

async function lire<T>(res: Response): Promise<T> {
  return ((await res.json()) as { data: T }).data;
}

function AvisClient() {
  // Un avis ne peut être publié que depuis la fiche d'une demande dont le
  // matching est "réalisé" (cf. /espace/demandes/$id) — jamais librement
  // contre n'importe quel prestataire. Cette page n'est donc plus qu'un
  // historique en lecture seule.
  const { data: avis, isLoading } = useQuery({
    queryKey: ["mes-avis"],
    queryFn: async () => lire<Avis[]>(await authorizedFetch("/api/avis")),
  });

  const { data: matchings } = useQuery({
    queryKey: ["mes-matchings-pour-avis"],
    queryFn: async () => lire<Matching[]>(await authorizedFetch("/api/matchings")),
    enabled: Boolean(avis?.length),
  });

  const prestataireIds = [
    ...new Set(
      (avis ?? [])
        .map((a) => matchings?.find((m) => m.id === a.matching_id)?.prestataire_id)
        .filter((v): v is string => Boolean(v)),
    ),
  ];

  const { data: prestataires } = useQuery({
    queryKey: ["prestataires-pour-avis", prestataireIds],
    queryFn: async () =>
      Promise.all(prestataireIds.map(async (id) => lire<Prestataire>(await authorizedFetch(`/api/prestataires/${id}`)))),
    enabled: prestataireIds.length > 0,
  });

  const nomPrestataire = (matchingId: string) => {
    const prestataireId = matchings?.find((m) => m.id === matchingId)?.prestataire_id;
    return prestataires?.find((p) => p.id === prestataireId)?.nom ?? "Prestataire";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Mes avis</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Retrouvez ici les avis que vous avez publiés après chaque intervention réalisée.
        </p>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Chargement…</p>
      ) : (avis?.length ?? 0) === 0 ? (
        <p className="text-sm text-muted-foreground">
          Vous n'avez pas encore publié d'avis — c'est possible depuis le détail d'une demande une fois l'intervention réalisée.
        </p>
      ) : (
        <ul className="space-y-3">
          {avis!.map((a) => (
            <li key={a.id} className="rounded-2xl border border-border bg-card p-4">
              <p className="text-sm font-semibold text-foreground">
                {nomPrestataire(a.matching_id)} · {a.note}/5
              </p>
              {a.commentaire && <p className="mt-1 text-sm text-muted-foreground">{a.commentaire}</p>}
              {a.reponse && (
                <p className="mt-2 rounded-xl bg-muted p-2 text-sm text-muted-foreground">
                  Réponse du prestataire : {a.reponse}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
