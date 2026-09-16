/**
 * ProviderCard — src/components/maideres/ProviderCard.tsx
 *
 * Basé sur les vrais types de src/lib/maidere.ts (Prestataire /
 * PrestataireClasse produit par classerPrestataires), pas des props
 * inventées. `recommande` est décidé par le parent (ex: rank 0 après tri),
 * pas par la carte elle-même — une carte ne sait pas si elle est la
 * meilleure d'une liste qu'elle ne voit pas.
 *
 * Deux badges distincts du brief, pas interchangeables :
 *  - "Réseau vérifié"        → statut vérifié/actif (tout prestataire onboardé)
 *  - "Sélectionné par MAIDERES" → top du classement pour CETTE demande (prop recommande)
 */
import { Star, MapPin, ShieldCheck, Sparkles } from "lucide-react";
import type { Prestataire, PrestataireClasse } from "@/lib/maidere";
import { SecondaryButton } from "./SecondaryButton";

type ProviderCardData = Prestataire | PrestataireClasse;

function hasScore(p: ProviderCardData): p is PrestataireClasse {
  return "score" in p;
}

export interface ProviderCardProps {
  prestataire: ProviderCardData;
  /** Vrai pour le(s) résultat(s) en tête du classement de CETTE demande — décidé par le parent. */
  recommande?: boolean;
  onVoirFiche?: (id: string) => void;
  className?: string;
}

export function ProviderCard({ prestataire: p, recommande = false, onVoirFiche, className }: ProviderCardProps) {
  const verifie = p.statut === "verifie" || p.statut === "actif";

  return (
    <article
      className={`flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-sm ${className ?? ""}`}
    >
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-bold text-foreground">{p.nom}</h3>
          <p className="text-xs text-muted-foreground">{p.metier}</p>
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
        <span className="inline-flex items-center gap-1">
          <Star className="size-3.5 fill-current text-accent" aria-hidden="true" />
          {p.note.toFixed(1)}/5
        </span>
        <span className="inline-flex items-center gap-1">
          <MapPin className="size-3.5" aria-hidden="true" />
          {p.quartier}
          {hasScore(p) && p.distance !== null ? ` · ${p.distance.toFixed(1)} km` : ""}
        </span>
      </div>

      {hasScore(p) && p.raisons.length > 0 && (
        <ul className="flex flex-wrap gap-1.5" aria-label="Pourquoi ce prestataire">
          {p.raisons.map((r) => (
            <li key={r} className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
              {r}
            </li>
          ))}
        </ul>
      )}

      <SecondaryButton className="mt-1 self-start" onClick={() => onVoirFiche?.(p.id)}>
        Voir la fiche
      </SecondaryButton>
    </article>
  );
}
