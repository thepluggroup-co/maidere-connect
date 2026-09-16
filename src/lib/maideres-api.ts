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
  metier_id: string | null;
  metier_libelle: string | null;
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

export type Client = {
  id: string;
  profile_id: string;
  nom: string;
  telephone: string;
  quartier: string | null;
  type_client: "particulier" | "entreprise" | "organisation";
  niu: string | null;
  whatsapp: string | null;
  email: string | null;
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

// Suivi terrain d'une intervention (créée automatiquement quand le
// prestataire accepte un matching, cf. apps/api/src/routes/matchings.ts
// PATCH /:id/accepter). Miroir de packages/contracts/src/interventions.ts
// (repo MAIDERES) — pas de package partagé entre les deux repos, donc à
// tenir manuellement synchronisé si l'API évolue côté ERP.
export type StatutIntervention =
  | "planifiee"
  | "en_route"
  | "sur_site"
  | "en_cours"
  | "realisee"
  | "echouee"
  | "reportee"
  | "annulee";

export type Intervention = {
  id: string;
  matching_id: string;
  statut: StatutIntervention;
  date_planifiee: string | null;
  creneau_fin: string | null;
  date_debut: string | null;
  date_fin: string | null;
  checkin_at: string | null;
  checkout_at: string | null;
  localisation_checkin: string | null;
  preuve: string | null;
  created_at: string;
  updated_at: string;
};

export type InterventionEvenement = {
  id: string;
  intervention_id: string;
  type: "changement_statut" | "note" | "checkin" | "checkout" | "retard";
  ancien_statut: StatutIntervention | null;
  nouveau_statut: StatutIntervention | null;
  commentaire: string | null;
  localisation: string | null;
  operateur_id: string | null;
  created_at: string;
};

/** Transitions autorisées — doit rester identique à INTERVENTION_TRANSITIONS (apps/api/src/routes/interventions.ts, repo MAIDERES). */
export const INTERVENTION_TRANSITIONS: Record<StatutIntervention, StatutIntervention[]> = {
  planifiee: ["en_route", "sur_site", "reportee", "annulee"],
  en_route: ["sur_site", "reportee", "annulee"],
  sur_site: ["en_cours", "reportee", "annulee"],
  en_cours: ["realisee", "echouee", "annulee"],
  reportee: ["planifiee", "en_route", "annulee"],
  realisee: [],
  echouee: [],
  annulee: [],
};

export const STATUT_INTERVENTION_LABEL: Record<StatutIntervention, string> = {
  planifiee: "Planifiée",
  en_route: "En route",
  sur_site: "Sur site",
  en_cours: "Intervention en cours",
  realisee: "Réalisée",
  echouee: "Échouée",
  reportee: "Reportée",
  annulee: "Annulée",
};

/** GET /api/categories_services — authentifié, filtré aux catégories actives pour un non-staff. */
export async function listerCategories(): Promise<CategorieService[]> {
  const res = await authorizedFetch("/api/categories_services");
  return lireJson<CategorieService[]>(res, "GET /api/categories_services");
}

/** GET /api/public/categories_services — public, aucune session requise (recherche anonyme). */
export async function listerCategoriesPubliques(): Promise<
  Pick<CategorieService, "id" | "libelle">[]
> {
  const res = await publicFetch("/api/public/categories_services");
  return lireJson<Pick<CategorieService, "id" | "libelle">[]>(
    res,
    "GET /api/public/categories_services",
  );
}

export async function monClient(): Promise<Client | null> {
  const res = await authorizedFetch("/api/clients");
  const rows = await lireJson<Client[]>(res, "GET /api/clients");
  return rows[0] ?? null;
}

export async function modifierMonClient(
  id: string,
  payload: Pick<Client, "nom" | "telephone" | "quartier">,
): Promise<Client> {
  const res = await authorizedFetch(`/api/clients/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  return lireJson<Client>(res, "PATCH /api/clients/:id");
}

async function lireJson<T>(res: Response, contexte: string): Promise<T> {
  if (!res.ok) throw new Error(`${contexte} a échoué (${res.status})`);
  const body = (await res.json()) as { data: T };
  return body.data;
}

export async function listerPrestataires(filtres: {
  ville?: string;
  quartier?: string;
  categorieId?: string;
  recherche?: string;
}): Promise<Prestataire[]> {
  const params = new URLSearchParams();
  if (filtres.ville) params.set("ville", filtres.ville);
  if (filtres.quartier) params.set("quartier", filtres.quartier);
  if (filtres.categorieId) params.set("categorie_id", filtres.categorieId);
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

// ── Demandes / matchings / interventions — suivi de bout en bout ────────────

export async function chargerDemande(id: string): Promise<Demande> {
  return lireJson<Demande>(await authorizedFetch(`/api/demandes/${id}`), "GET /api/demandes/:id");
}

export async function listerMatchings(filtres: { demande_id?: string } = {}): Promise<Matching[]> {
  const params = new URLSearchParams();
  if (filtres.demande_id) params.set("demande_id", filtres.demande_id);
  return lireJson<Matching[]>(
    await authorizedFetch(`/api/matchings?${params.toString()}`),
    "GET /api/matchings",
  );
}

/** PATCH /api/matchings/:id/accepter — le prestataire accepte la demande qui lui a été proposée ; crée l'intervention à suivre. */
export async function accepterMatching(id: string): Promise<Matching> {
  return lireJson<Matching>(
    await authorizedFetch(`/api/matchings/${id}/accepter`, { method: "PATCH" }),
    "PATCH /api/matchings/:id/accepter",
  );
}

/** PATCH /api/matchings/:id/refuser — le prestataire décline ; la demande retourne à l'opérateur pour re-dispatch. */
export async function refuserMatching(id: string, motif_echec?: string): Promise<Matching> {
  return lireJson<Matching>(
    await authorizedFetch(`/api/matchings/${id}/refuser`, {
      method: "PATCH",
      body: JSON.stringify({ motif_echec: motif_echec || null }),
    }),
    "PATCH /api/matchings/:id/refuser",
  );
}

/** PATCH /api/matchings/:id/cloturer — clôt la mission (réalisée ou échouée). Le motif est requis en cas d'échec. */
export async function cloturerMatching(
  id: string,
  issue: "realise" | "echoue",
  motif_echec?: string,
): Promise<Matching> {
  return lireJson<Matching>(
    await authorizedFetch(`/api/matchings/${id}/cloturer`, {
      method: "PATCH",
      body: JSON.stringify({ issue, motif_echec: motif_echec || null }),
    }),
    "PATCH /api/matchings/:id/cloturer",
  );
}

export async function listerInterventions(
  filtres: { matching_id?: string } = {},
): Promise<Intervention[]> {
  const params = new URLSearchParams();
  if (filtres.matching_id) params.set("matching_id", filtres.matching_id);
  return lireJson<Intervention[]>(
    await authorizedFetch(`/api/interventions?${params.toString()}`),
    "GET /api/interventions",
  );
}

export async function listerEvenementsIntervention(
  interventionId: string,
): Promise<InterventionEvenement[]> {
  return lireJson<InterventionEvenement[]>(
    await authorizedFetch(`/api/interventions/${interventionId}/evenements`),
    "GET /api/interventions/:id/evenements",
  );
}

/** PATCH /api/interventions/:id/checkin — arrivée sur site, géolocalisation optionnelle. Bascule automatiquement le statut à 'sur_site'. */
export async function checkinIntervention(
  id: string,
  localisation_checkin?: string,
): Promise<Intervention> {
  return lireJson<Intervention>(
    await authorizedFetch(`/api/interventions/${id}/checkin`, {
      method: "PATCH",
      body: JSON.stringify({ localisation_checkin: localisation_checkin || null }),
    }),
    "PATCH /api/interventions/:id/checkin",
  );
}

/** PATCH /api/interventions/:id/checkout — fin de présence sur site (nécessite un check-in préalable). */
export async function checkoutIntervention(id: string): Promise<Intervention> {
  return lireJson<Intervention>(
    await authorizedFetch(`/api/interventions/${id}/checkout`, { method: "PATCH" }),
    "PATCH /api/interventions/:id/checkout",
  );
}

/** PATCH /api/interventions/:id/statut — transition validée côté API contre INTERVENTION_TRANSITIONS. */
export async function updateStatutIntervention(
  id: string,
  statut: StatutIntervention,
): Promise<Intervention> {
  return lireJson<Intervention>(
    await authorizedFetch(`/api/interventions/${id}/statut`, {
      method: "PATCH",
      body: JSON.stringify({ statut }),
    }),
    "PATCH /api/interventions/:id/statut",
  );
}

/** PATCH /api/interventions/:id/reporter — reporte à une nouvelle date planifiée (ISO 8601), avec motif facultatif. */
export async function reporterIntervention(
  id: string,
  date_planifiee: string,
  commentaire?: string,
): Promise<Intervention> {
  return lireJson<Intervention>(
    await authorizedFetch(`/api/interventions/${id}/reporter`, {
      method: "PATCH",
      body: JSON.stringify({ date_planifiee, commentaire: commentaire || null }),
    }),
    "PATCH /api/interventions/:id/reporter",
  );
}
