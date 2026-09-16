/**
 * StatusBadge (vitrine) — src/components/maideres/StatusBadge.tsx
 *
 * Contrairement à la version ERP (packages/ui, côté opérations), la vitrine
 * n'a pas besoin des statuts de matching/intervention/reversement/notif —
 * ce sont des concepts internes à l'équipe MAIDERES qui n'ont rien à faire
 * dans l'espace client (cohérent avec la philosophie "Concierge" du brief :
 * l'utilisateur ne voit jamais la mécanique interne). Seuls Demande et
 * Paiement sont exposés côté client.
 *
 * Mêmes tokens que l'ERP au niveau conceptuel, mais noms de classes
 * différents car la vitrine nomme ses tokens --etat-* (styles.css) et non
 * --success/--warning/--info/--destructive. Écart de nommage documenté
 * dans tokens.ts (étape 2) — pas corrigé ici pour ne pas toucher aux deux
 * fichiers CSS en même temps que les composants.
 */
import { CheckCircle2, Clock3, Loader2, AlertTriangle, MinusCircle, type LucideIcon } from "lucide-react";

export type StatusBucket = "succes" | "attente" | "cours" | "litige" | "neutre";

const BUCKET_STYLE: Record<StatusBucket, { className: string; icon: LucideIcon }> = {
  succes:  { className: "bg-etat-succes text-etat-succes-fg",   icon: CheckCircle2 },
  attente: { className: "bg-etat-attente text-etat-attente-fg", icon: Clock3 },
  cours:   { className: "bg-etat-cours text-etat-cours-fg",     icon: Loader2 },
  litige:  { className: "bg-etat-litige text-etat-litige-fg",   icon: AlertTriangle },
  neutre:  { className: "bg-secondary text-secondary-foreground", icon: MinusCircle },
};

interface StatusDef { label: string; bucket: StatusBucket }
type StatusMap = Record<string, StatusDef>;

// Miroir de packages/contracts/src/enums.ts::DemandeStatutSchema (repo MAIDERES)
export const DEMANDE_STATUS_MAP: StatusMap = {
  nouvelle:      { label: "Un conseiller cherche pour vous...", bucket: "attente" },
  en_traitement: { label: "En traitement",                       bucket: "cours" },
  matchee:       { label: "Prestataire trouvé",                  bucket: "cours" },
  en_cours:      { label: "En cours",                             bucket: "cours" },
  realisee:      { label: "Terminée",                             bucket: "succes" },
  annulee:       { label: "Annulée",                              bucket: "neutre" },
};
// Libellés humanisés pour "nouvelle"/"matchee" — cf. philosophie Concierge
// du brief (micro-copies "Un conseiller cherche pour vous..."). Le reste
// garde un libellé neutre : pas besoin d'habiller ce qui est déjà clair.

// Miroir de PaiementStatutSchema
export const PAIEMENT_STATUS_MAP: StatusMap = {
  en_attente: { label: "En attente",  bucket: "attente" },
  paye:       { label: "Payé",        bucket: "succes" },
  echoue:     { label: "Échec",       bucket: "litige" },
  rembourse:  { label: "Remboursé",   bucket: "neutre" },
};

export interface StatusBadgeProps {
  status: string;
  map: StatusMap;
  className?: string;
}

export function StatusBadge({ status, map, className }: StatusBadgeProps) {
  const def = map[status] ?? { label: status, bucket: "neutre" as const };
  const { className: bucketClass, icon: Icon } = BUCKET_STYLE[def.bucket];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ${bucketClass} ${className ?? ""}`}
    >
      <Icon className="size-3.5" aria-hidden="true" />
      {def.label}
    </span>
  );
}
