/**
 * Logique métier MAIDERES adaptée depuis la console MAIDERES.
 * Couverture : Douala et Yaoundé (Cameroun, XAF) et Abidjan (Côte d'Ivoire, XOF).
 * Les deux zones utilisent le franc CFA, affiché « FCFA ».
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
  immediate: { libelle: "Immédiate", poids: 0, delaiHeures: 2, ton: "text-etat-litige-fg" },
  urgent: { libelle: "Urgent", poids: 1, delaiHeures: 24, ton: "text-etat-attente-fg" },
  planifie: { libelle: "Planifié", poids: 2, delaiHeures: 72, ton: "text-etat-cours-fg" },
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

/* --------------- Géolocalisation Douala · Yaoundé · Abidjan ---------------- */

export type Ville = "Douala" | "Yaoundé" | "Abidjan";

export const VILLES: { nom: Ville; pays: string; devise: "XAF" | "XOF" }[] = [
  { nom: "Douala", pays: "Cameroun", devise: "XAF" },
  { nom: "Yaoundé", pays: "Cameroun", devise: "XAF" },
  { nom: "Abidjan", pays: "Côte d'Ivoire", devise: "XOF" },
];

export const QUARTIERS: Record<string, { lat: number; lng: number; ville: Ville }> = {
  /* Douala */
  Bonapriso: { lat: 4.0261, lng: 9.7019, ville: "Douala" },
  Bonanjo: { lat: 4.0447, lng: 9.6884, ville: "Douala" },
  Akwa: { lat: 4.0511, lng: 9.7009, ville: "Douala" },
  Bonamoussadi: { lat: 4.0947, lng: 9.7391, ville: "Douala" },
  Deïdo: { lat: 4.0642, lng: 9.7136, ville: "Douala" },
  Makepe: { lat: 4.0819, lng: 9.7442, ville: "Douala" },
  "New Bell": { lat: 4.0342, lng: 9.7167, ville: "Douala" },
  Bepanda: { lat: 4.0672, lng: 9.7331, ville: "Douala" },
  Logbessou: { lat: 4.0906, lng: 9.7758, ville: "Douala" },
  Bonabéri: { lat: 4.0736, lng: 9.6708, ville: "Douala" },
  /* Yaoundé */
  Bastos: { lat: 3.8917, lng: 11.5089, ville: "Yaoundé" },
  Nlongkak: { lat: 3.8836, lng: 11.5169, ville: "Yaoundé" },
  Mvan: { lat: 3.8189, lng: 11.5306, ville: "Yaoundé" },
  Essos: { lat: 3.8783, lng: 11.5364, ville: "Yaoundé" },
  Mvog_Mbi: { lat: 3.8558, lng: 11.5236, ville: "Yaoundé" },
  Biyem_Assi: { lat: 3.8331, lng: 11.4711, ville: "Yaoundé" },
  Ngousso: { lat: 3.9022, lng: 11.5442, ville: "Yaoundé" },
  Odza: { lat: 3.8114, lng: 11.5486, ville: "Yaoundé" },
  Nsimeyong: { lat: 3.8347, lng: 11.4989, ville: "Yaoundé" },
  Emana: { lat: 3.9422, lng: 11.5175, ville: "Yaoundé" },
  /* Abidjan */
  Plateau: { lat: 5.3247, lng: -4.0227, ville: "Abidjan" },
  Cocody: { lat: 5.3548, lng: -3.9877, ville: "Abidjan" },
  Riviera: { lat: 5.3607, lng: -3.9401, ville: "Abidjan" },
  Angré: { lat: 5.3949, lng: -3.9822, ville: "Abidjan" },
  Marcory: { lat: 5.3007, lng: -3.9857, ville: "Abidjan" },
  Treichville: { lat: 5.2933, lng: -4.0106, ville: "Abidjan" },
  Koumassi: { lat: 5.2924, lng: -3.9508, ville: "Abidjan" },
  "Port-Bouët": { lat: 5.2589, lng: -3.9264, ville: "Abidjan" },
  Yopougon: { lat: 5.3364, lng: -4.0864, ville: "Abidjan" },
  Abobo: { lat: 5.4189, lng: -4.0157, ville: "Abidjan" },
  Adjamé: { lat: 5.3628, lng: -4.0244, ville: "Abidjan" },
  Attécoubé: { lat: 5.3396, lng: -4.0432, ville: "Abidjan" },
};

export function quartiersParVille(ville: Ville): string[] {
  return Object.entries(QUARTIERS)
    .filter(([, v]) => v.ville === ville)
    .map(([k]) => k.replace(/_/g, "-"));
}

export function villeDuQuartier(nom: string): Ville | null {
  return coordsQuartier(nom)?.ville ?? null;
}


const normalise = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/gi, "")
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
