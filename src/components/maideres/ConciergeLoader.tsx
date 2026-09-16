/**
 * ConciergeLoader — src/components/maideres/ConciergeLoader.tsx
 * "Un conseiller cherche pour vous..." — état de chargement humanisé
 * demandé par le brief (transition humain → numérique du Concierge MVP).
 *
 * Le shimmer utilise une classe .animate-shimmer ajoutée à src/styles.css
 * dans ce même commit (pas de nouvelle dépendance, juste un keyframe CSS).
 */
import { URGENCES, type NiveauUrgence } from "@/lib/maidere";
import { MaideresIcon } from "./Logo";

export interface ConciergeLoaderProps {
  phrase?: string;
  sousTexte?: string;
  /** Si fourni, affiche le délai cible réel (cf. URGENCES) au lieu d'un texte générique. */
  urgence?: NiveauUrgence;
  className?: string;
}

export function ConciergeLoader({
  phrase = "Un conseiller MAIDERES s'en occupe",
  sousTexte,
  urgence,
  className,
}: ConciergeLoaderProps) {
  const texteSecondaire =
    sousTexte ??
    (urgence
      ? `Réponse généralement sous ${URGENCES[urgence].delaiHeures} h`
      : "On revient vers vous très vite.");

  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex items-center gap-4 rounded-xl border border-border bg-card p-4 ${className ?? ""}`}
    >
      <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-etat-cours">
        <MaideresIcon size={24} />
        <span className="absolute inset-0 rounded-full animate-shimmer" aria-hidden="true" />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-foreground">{phrase}</span>
        <span className="block text-xs text-muted-foreground">{texteSecondaire}</span>
      </span>
    </div>
  );
}
