/**
 * ProviderCard — src/components/maideres/ProviderCard.tsx
 *
 * ⚠️ Deuxième version. La première (commit 8d7038f) était câblée sur
 * `Prestataire`/`PrestataireClasse` de @/lib/maidere.ts — qui n'est en
 * réalité utilisé QUE par la démo illustrative de la landing
 * (index.tsx). La vraie page de liste (prestataires.index.tsx) et la
 * fiche détail utilisent un type Prestataire DIFFÉRENT, celui de
 * @/lib/maideres-api.ts (la vraie réponse de l'API publique) — vérifié
 * par grep avant de recorriger, pas supposé. Deux modèles du même nom
 * dans ce repo ; à unifier un jour, pas le sujet ici.
 *
 * Cette version consomme le type réel de l'API. `recommande`,
 * `distanceKm` et `raisons` restent des props À PART, fournies par
 * l'appelant (ex. la démo de la landing peut les calculer via
 * classerPrestataires et les passer ici), plutôt que codées en dur dans
 * le type — ça permet à CE composant de marcher aussi bien sur la vraie
 * page de liste (qui n'a ni score ni distance) que sur la démo.
 */
import { Star, MapPin, ShieldCheck, Sparkles } from "lucide-react";
import type { Prestataire } from "@/lib/maideres-api";
import { SecondaryButton } from "./SecondaryButton";

export interface ProviderCardProps {
  prestataire: Prestataire;
  /** Vrai pour le(s) résultat(s) en tête du classement de CETTE demande — décidé par le parent. */
  recommande?: boolean;
  distanceKm?: number;
  raisons?: string[];
  onVoirFiche?: (id: string) => void;
  className?: string;
}

export function ProviderCard({
  prestataire: p,
  recommande = false,
  distanceKm,
  raisons,
  onVoirFiche,
  className,
}: ProviderCardProps) {
  // L'API publique ne renvoie que des prestataires déjà vetted ; `statut`
  // n'est même pas toujours présent dans cette réponse (cf. commentaire
  // OFFRE_PUBLIC_FIELDS dans maideres-api.ts). On n'affiche "non vérifié"
  // que si le champ est explicitement 'en_attente' — jamais par défaut.
  const verifie = p.statut !== "en_attente";
  const note = Number(p.note_moyenne);

  return (
    <article
      className={`flex flex-col gap-3 overflow-hidden rounded-xl border border-border bg-card shadow-sm ${className ?? ""}`}
    >
      {/* Vignette : la réalisation la plus récente du prestataire, quand il
          en a publié une (galerie self-service, 0027). Recommandation
          "ressembler davantage à Uber/Bolt/FB Marketplace" — la liste était
          jusqu'ici purement textuelle. Repli neutre (initiale) sinon, plutôt
          qu'une image cassée ou un espace vide silencieux. */}
      <div className="aspect-[16/9] w-full overflow-hidden bg-muted">
        {p.photo_couverture ? (
          <img
            src={p.photo_couverture}
            alt=""
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-muted-foreground/40">
            {p.nom.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 px-4 pb-4">
        <header className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-bold text-foreground">{p.nom}</h3>
            <p className="text-xs text-muted-foreground">{p.metier_libelle ?? "Prestataire"}</p>
          </div>
          {!p.disponible && (
            <span className="shrink-0 rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold text-secondary-foreground">
              Indisponible
            </span>
          )}
        </header>

        <div className="flex flex-wrap items-center gap-2">
          {recommande && (
            <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-[10px] font-semibold text-accent-foreground">
              <Sparkles className="size-3" aria-hidden="true" />
              Sélectionné par MAIDERES
            </span>
          )}
          {verifie && (
            <span className="inline-flex items-center gap-1 rounded-full bg-etat-succes px-2 py-0.5 text-[10px] font-semibold text-etat-succes-fg">
              <ShieldCheck className="size-3" aria-hidden="true" />
              Réseau vérifié
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {!Number.isNaN(note) && note > 0 && (
            <span className="inline-flex items-center gap-1">
              <Star className="size-3.5 fill-current text-accent" aria-hidden="true" />
              {note.toFixed(1)}/5
            </span>
          )}
          {(p.quartier || p.ville) && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-3.5" aria-hidden="true" />
              {[p.quartier, p.ville].filter(Boolean).join(", ")}
              {typeof distanceKm === "number" ? ` · ${distanceKm.toFixed(1)} km` : ""}
            </span>
          )}
        </div>

        {raisons && raisons.length > 0 && (
          <ul className="flex flex-wrap gap-1.5" aria-label="Pourquoi ce prestataire">
            {raisons.map((r) => (
              <li
                key={r}
                className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground"
              >
                {r}
              </li>
            ))}
          </ul>
        )}

        {p.bio && <p className="line-clamp-2 text-xs text-muted-foreground">{p.bio}</p>}

        <SecondaryButton className="mt-1 self-start" onClick={() => onVoirFiche?.(p.id)}>
          Voir la fiche
        </SecondaryButton>
      </div>
    </article>
  );
}
