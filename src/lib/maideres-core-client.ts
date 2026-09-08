/**
 * Client HTTP vers l'API MAIDERES (apps/api du monorepo MAIDERES).
 *
 * maidere-connect n'a pas d'API propre — jusqu'ici il lisait/écrivait
 * directement dans son propre projet Supabase (jetable, sans données
 * réelles). Depuis l'unification de l'authentification, ce repo pointe sur
 * le MÊME projet Supabase que MAIDERES (voir .env) : Supabase Auth y est
 * donc utilisé directement (cf. docs/integration/03-AUTH-MAPPING.md,
 * MAIDERES §17 — une seule source d'identité, appelée directement par
 * plusieurs frontends est conforme), mais toute donnée métier (fiche
 * client/prestataire, etc.) passe par l'API MAIDERES plutôt que par une
 * requête Supabase directe, pour ne pas dupliquer la validation déjà
 * écrite côté API (cf. MAIDERES §25/§36).
 */
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

const API_URL = (import.meta.env["VITE_MAIDERES_API_URL"] as string | undefined)?.replace(/\/+$/, "");

export type Identite = {
  isStaff: boolean;
  clientId: string | null;
  prestataireId: string | null;
};

function requireApiUrl(): string {
  if (!API_URL) {
    throw new Error(
      "VITE_MAIDERES_API_URL manquant — impossible de contacter l'API MAIDERES. " +
        "Voir .env.example.",
    );
  }
  return API_URL;
}

/** Appel authentifié vers l'API MAIDERES (Bearer = session Supabase courante). */
export async function authorizedFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const base = requireApiUrl();
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error("Session Supabase absente — utilisateur non authentifié.");

  return fetch(`${base}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(init.headers ?? {}),
    },
  });
}

/**
 * Appel PUBLIC vers l'API MAIDERES (/api/public/*, cf. apps/api/src/routes/
 * public.ts) — jamais de token, utilisé par les pages accessibles aux
 * visiteurs anonymes (annuaire, fiche prestataire, promotions actives).
 */
export async function publicFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const base = requireApiUrl();
  return fetch(`${base}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init.headers ?? {}) },
  });
}

/** GET /api/profile/me — identité métier dérivée (cf. apps/api/src/routes/profile.ts). */
export async function fetchMonIdentite(): Promise<Identite> {
  const res = await authorizedFetch("/api/profile/me");
  if (!res.ok) throw new Error(`GET /api/profile/me a échoué (${res.status})`);
  const { data } = (await res.json()) as {
    data: { is_staff: boolean; client_id: string | null; prestataire_id: string | null };
  };
  return { isStaff: data.is_staff, clientId: data.client_id, prestataireId: data.prestataire_id };
}

type FicheMetierPayload = {
  nom: string;
  telephone: string;
  quartier?: string;
  ville?: string;
  metier?: string;
};

/** POST /api/clients — auto-inscription (profile_id = l'utilisateur authentifié). */
export async function creerFicheClient(payload: FicheMetierPayload): Promise<void> {
  const res = await authorizedFetch("/api/clients", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  // 409 = fiche déjà existante (deux résolutions concurrentes, ou déjà
  // provisionnée) — pas une erreur pour l'appelant, qui veut juste
  // "s'assurer qu'elle existe".
  if (!res.ok && res.status !== 409) throw new Error(`POST /api/clients a échoué (${res.status})`);
}

/**
 * POST /api/prestataires — auto-inscription. `categories` part vide : aucune
 * sélection de catégorie n'existe encore dans le formulaire d'inscription
 * connect (cf. docs/integration/04-API-MAPPING.md, gap "gestion des offres
 * en self-service" — pas encore construit côté MAIDERES). Le staff complète
 * l'onboarding (catégories, activation) via la Console 360, comme pour un
 * prestataire recruté par téléphone.
 */
export async function creerFichePrestataire(payload: FicheMetierPayload): Promise<void> {
  const res = await authorizedFetch("/api/prestataires", {
    method: "POST",
    body: JSON.stringify({ ...payload, categories: [] }),
  });
  if (!res.ok && res.status !== 409) throw new Error(`POST /api/prestataires a échoué (${res.status})`);
}

/**
 * Résout l'identité métier d'un utilisateur authentifié, et provisionne sa
 * fiche client/prestataire si elle manque encore.
 *
 * Cas où elle manque au premier appel : `supabase.auth.signUp()` n'a pas pu
 * créer la fiche lui-même (confirmation e-mail requise → pas de session au
 * moment de l'inscription, cf. AuthCard.tsx) ou un échec réseau ponctuel.
 * `user.user_metadata.role` (fixé à l'inscription, survit à la confirmation
 * d'e-mail) indique quelle fiche créer. Idempotent : un appel répété une
 * fois la fiche déjà créée ne fait rien (ownClientId/ownPrestataireId côté
 * API retournent alors non-null, donc `dejaProvisionne` est vrai).
 */
export async function resoudreIdentitePourUtilisateur(user: User): Promise<Identite> {
  let identite = await fetchMonIdentite();

  const dejaProvisionne = identite.isStaff || identite.clientId !== null || identite.prestataireId !== null;
  const roleInscription = user.user_metadata?.["role"] as string | undefined;

  if (!dejaProvisionne && (roleInscription === "client" || roleInscription === "prestataire")) {
    const quartier = user.user_metadata?.["quartier"] as string | undefined;
    const ville = user.user_metadata?.["ville"] as string | undefined;
    const metier = user.user_metadata?.["metier"] as string | undefined;
    const payload: FicheMetierPayload = {
      nom: (user.user_metadata?.["nom_complet"] as string | undefined) || user.email || "Utilisateur",
      telephone: (user.user_metadata?.["telephone"] as string | undefined) || "",
      ...(quartier ? { quartier } : {}),
      ...(ville ? { ville } : {}),
      ...(metier ? { metier } : {}),
    };
    try {
      if (roleInscription === "client") await creerFicheClient(payload);
      else await creerFichePrestataire(payload);
      identite = await fetchMonIdentite();
    } catch {
      // Laissé à une prochaine résolution (prochaine navigation/login) —
      // ne doit jamais faire échouer la connexion elle-même.
    }
  }

  return identite;
}
