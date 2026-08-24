/**
 * Logique métier MAIDERE adaptée depuis la console MAIDERES.
 * Adaptations : devise XOF (FCFA) et repères de quartiers d'Abidjan (Côte d'Ivoire).
 */

/* ---------------------------------- Format --------------------------------- */

export function xof(n: number | null | undefined): string {
  if (n === null || n === undefined || Number.isNaN(n)) return "—";
  return `${Math.round(n).toLocaleString("fr-FR").replace(/\u202f|\u00a0/g, " ")} FCFA`;
}

export function dateHeure(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/* --------------------------------- Urgence --------------------------------- */

export type NiveauUrgence = "immediate" | "urgent" | "planifie";

export const URGENCES: Record<
  NiveauUrgence,
  { libelle: string; poids: number; delaiHeures: number; ton: string }
> = {
  immediate: { libelle: "Immédiate", poids: 0, delaiHeures: 2, ton: "text-destructive" },
  urgent: { libelle: "Urgent", poids: 1, delaiHeures: 24, ton: "text-brand-orange" },
  planifie: { libelle: "Planifié", poids: 2, delaiHeures: 72, ton: "text-brand-sky" },
};

/** Délai cible SLA à partir de la création. */
export function delaiCible(creation: Date, urgence: NiveauUrgence): Date {
  return new Date(creation.getTime() + URGENCES[urgence].delaiHeures * 3600_000);
}

export type StatutDemande =
  | "nouvelle"
  | "en_dispatch"
  | "affectee"
  | "en_cours"
  | "realisee"
  | "annulee";

export function enRetard(cible: Date | null, statut: StatutDemande, maintenant = new Date()) {
  if (!cible) return false;
  if (statut === "realisee" || statut === "annulee") return false;
  return cible.getTime() < maintenant.getTime();
}

export function resteAvantDelai(cible: Date | null, maintenant = new Date()): string {
  if (!cible) return "—";
  const diff = cible.getTime() - maintenant.getTime();
  const abs = Math.abs(diff);
  const j = Math.floor(abs / 86_400_000);
  const h = Math.floor((abs % 86_400_000) / 3_600_000);
  const min = Math.floor((abs % 3_600_000) / 60_000);
  const texte = j > 0 ? `${j} j ${h} h` : h > 0 ? `${h} h ${min} min` : `${min} min`;
  return diff < 0 ? `retard ${texte}` : `dans ${texte}`;
}

/* -------------------------- Géolocalisation Abidjan ------------------------- */

export const QUARTIERS: Record<string, { lat: number; lng: number }> = {
  Plateau: { lat: 5.3247, lng: -4.0227 },
  Cocody: { lat: 5.3548, lng: -3.9877 },
  "Riviera": { lat: 5.3607, lng: -3.9401 },
  Angré: { lat: 5.3949, lng: -3.9822 },
  Marcory: { lat: 5.3007, lng: -3.9857 },
  Treichville: { lat: 5.2933, lng: -4.0106 },
  Koumassi: { lat: 5.2924, lng: -3.9508 },
  "Port-Bouët": { lat: 5.2589, lng: -3.9264 },
  Yopougon: { lat: 5.3364, lng: -4.0864 },
  Abobo: { lat: 5.4189, lng: -4.0157 },
  Adjamé: { lat: 5.3628, lng: -4.0244 },
  Attécoubé: { lat: 5.3396, lng: -4.0432 },
  Bingerville: { lat: 5.3556, lng: -3.8853 },
  Songon: { lat: 5.3122, lng: -4.2497 },
  Anyama: { lat: 5.4947, lng: -4.0517 },
};

const normalise = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

export function coordsQuartier(nom: string) {
  const cible = normalise(nom);
  const entree = Object.entries(QUARTIERS).find(([k]) => {
    const kn = normalise(k);
    return kn === cible || kn.includes(cible) || cible.includes(kn);
  });
  return entree?.[1] ?? null;
}

export function distanceKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const R = 6371;
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/* ---------------------------- Matching / scoring ---------------------------- */

export type StatutPrestataire = "candidat" | "verifie" | "actif" | "suspendu";

export type Prestataire = {
  id: string;
  nom: string;
  metier: string;
  categorieId: string | null;
  statut: StatutPrestataire;
  disponible: boolean;
  quartier: string;
  zonesCouverture: string[];
  note: number;
};

export type DemandeSimple = { categorieId: string; quartier: string };

export type PrestataireClasse = Prestataire & {
  score: number;
  distance: number | null;
  raisons: string[];
};

export function classerPrestataires(
  demande: DemandeSimple,
  prestataires: Prestataire[],
): PrestataireClasse[] {
  const posDemande = coordsQuartier(demande.quartier);

  return prestataires
    .filter(
      (p) =>
        (p.statut === "actif" || p.statut === "verifie") &&
        p.disponible &&
        (p.categorieId === null || p.categorieId === demande.categorieId),
    )
    .map((p) => {
      let score = 40;
      const raisons: string[] = [];

      if (p.categorieId === demande.categorieId) {
        score += 12;
        raisons.push("métier correspondant");
      }
      if (p.statut === "actif") score += 6;

      const posP = coordsQuartier(p.quartier);
      let distance: number | null = null;
      if (posDemande && posP) {
        distance = distanceKm(posDemande, posP);
        score += Math.max(0, 32 - distance * 3.2);
        raisons.push(`${distance.toFixed(1)} km`);
      }

      if (p.zonesCouverture.some((z) => normalise(z) === normalise(demande.quartier))) {
        score += 14;
        raisons.push("zone couverte");
      }

      score += Math.min(12, p.note * 2.4);
      raisons.push(`note ${p.note.toFixed(1)}/5`);

      return { ...p, score: Math.min(100, Math.round(score)), distance, raisons };
    })
    .sort((a, b) => b.score - a.score);
}

/* ------------------------------- Commission -------------------------------- */

export const COMMISSION_GLOBALE_PCT = 15;

export type RegleCommission = { type: "pourcentage" | "montant_fixe"; valeur: number };

/** Priorité : override prestataire → règle catégorie → règle globale (15 %). */
export function calculerCommission(
  montant: number,
  regleCategorie?: RegleCommission | null,
  overridePrestataire?: RegleCommission | null,
): number {
  const regle: RegleCommission =
    overridePrestataire ?? regleCategorie ?? { type: "pourcentage", valeur: COMMISSION_GLOBALE_PCT };
  const brut = regle.type === "pourcentage" ? (montant * regle.valeur) / 100 : regle.valeur;
  return Math.max(0, Math.min(montant, Math.round(brut)));
}

export function reversement(
  montant: number,
  regleCategorie?: RegleCommission | null,
  overridePrestataire?: RegleCommission | null,
) {
  const montantCommission = calculerCommission(montant, regleCategorie, overridePrestataire);
  return { montantCommission, montantPrestataire: montant - montantCommission };
}
