/**
 * Couche d'accès aux données métier — appelle désormais l'API MAIDERES
 * (apps/api) plutôt que le projet Supabase directement, cf.
 * src/lib/maideres-core-client.ts et docs/integration/04-API-MAPPING.md.
 *
 * Les noms de champs suivent ceux de packages/db/src/schema.pg.ts
 * (`prestataires.nom`, pas `nom_affichage` ; pas de `verifie`/`publie` au
 * niveau prestataire — la visibilité publique est entièrement pilotée par
 * `statut`, cf. 0027/0028). Un prestataire renvoyé par `/api/public/*` est
 * par construction `statut='actif'`, donc déjà "vérifié" au sens où
 * l'entendait l'ancien modèle — plus besoin d'un champ séparé pour ça.
 */
import { authorizedFetch, publicFetch } from "@/lib/maideres-core-client";

export type Prestataire = {
  id: string;
  nom: string;
  telephone: string | null;
  quartier: string | null;
  ville: string | null;
  metier: string | null;
  bio: string | null;
  disponible: boolean;
  zones_couverture: string[];
  note_moyenne: string;
  statut?: "en_attente" | "actif" | "suspendu";
};

// `publie`/`created_at` : absents de la réponse publique (GET /api/public/*,
// cf. OFFRE_PUBLIC_FIELDS côté apps/api) mais présents sur la gestion
// self-service authentifiée (GET/POST/PATCH /api/offres) — optionnels ici
// plutôt que deux types séparés, connect ne distinguant pas les deux dans
// son propre state management.
export type Offre = {
  id: string;
  prestataire_id: string;
  categorie: string;
  titre: string;
  description: string | null;
  prestations: string[];
  prix: number;
  unite_prix: string;
  delai_heures: number | null;
  publie?: boolean;
  created_at?: string;
};

export type Promotion = {
  id: string;
  prestataire_id: string;
  offre_id: string | null;
  titre: string;
  description: string | null;
  remise_pct: number;
  debut: string;
  fin: string | null;
  active?: boolean;
  created_at?: string;
};

export type Realisation = {
  id: string;
  prestataire_id: string;
  titre: string | null;
  description: string | null;
  image_url: string;
  created_at?: string;
};

export type Avis = {
  id: string;
  matching_id: string;
  note: number;
  commentaire: string | null;
  reponse: string | null;
  created_at: string;
};

export type CategorieService = { id: string; libelle: string; actif: boolean };

export type Demande = {
  id: string;
  client_id: string;
  categorie_id: string;
  description: string;
  localisation: string | null;
  canal: "web" | "whatsapp" | "manuel";
  // 'en_cours' : jamais un statut cible direct de l'API demandes (voir
  // apps/api/src/routes/demandes.ts, DEMANDE_STAFF_TRANSITIONS) — posé par
  // le trigger sync_intervention_statut (0009) quand l'intervention liée
  // dépasse 'planifiee'. Un client peut donc légitimement le voir.
  statut: "nouvelle" | "en_traitement" | "matchee" | "en_cours" | "realisee" | "annulee";
  niveau_urgence: "immediate" | "urgent" | "planifie";
  date_souhaitee: string | null;
  delai_cible: string | null;
  created_at: string;
};

export type Matching = {
  id: string;
  demande_id: string;
  prestataire_id: string;
  operateur_id?: string | null;
  statut: "propose" | "accepte" | "refuse" | "realise" | "echoue";
  motif_echec: string | null;
  proposed_at: string;
  closed_at: string | null;
};

/** GET /api/categories_services — authentifié, filtré aux catégories actives pour un non-staff. */
export async function listerCategories(): Promise<CategorieService[]> {
  const res = await authorizedFetch("/api/categories_services");
  return lireJson<CategorieService[]>(res, "GET /api/categories_services");
}

export const CATEGORIES = [
  "Plomberie",
  "Bricolage & rénovation",
  "Restauration",
  "Hébergement",
  "Shopping",
  "Transport",
  "Immobilier",
  "Couture",
];

async function lireJson<T>(res: Response, contexte: string): Promise<T> {
  if (!res.ok) throw new Error(`${contexte} a échoué (${res.status})`);
  const body = (await res.json()) as { data: T };
  return body.data;
}

export async function listerPrestataires(filtres: {
  ville?: string;
  quartier?: string;
  categorie?: string;
  recherche?: string;
}): Promise<Prestataire[]> {
  const params = new URLSearchParams();
  if (filtres.ville) params.set("ville", filtres.ville);
  if (filtres.quartier) params.set("quartier", filtres.quartier);
  if (filtres.categorie) params.set("categorie", filtres.categorie);
  if (filtres.recherche) params.set("recherche", filtres.recherche);

  const res = await publicFetch(`/api/public/prestataires?${params.toString()}`);
  return lireJson<Prestataire[]>(res, "GET /api/public/prestataires");
}

export async function chargerFichePrestataire(id: string): Promise<{
  prestataire: Prestataire | null;
  offres: Offre[];
  promotions: Promotion[];
  realisations: Realisation[];
  avis: Avis[];
}> {
  const res = await publicFetch(`/api/public/prestataires/${id}`);
  return lireJson(res, "GET /api/public/prestataires/:id");
}

/** Fiche prestataire du compte actuellement connecté (ou null si c'est un client). */
export async function maFichePrestataire(): Promise<Prestataire | null> {
  const res = await authorizedFetch("/api/prestataires");
  const rows = await lireJson<Prestataire[]>(res, "GET /api/prestataires");
  return rows[0] ?? null;
}

export function moyenne(avis: { note: number }[]): number {
  if (avis.length === 0) return 0;
  return avis.reduce((s, a) => s + a.note, 0) / avis.length;
}
